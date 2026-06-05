import Company from '../models/company.model';
import CompanyAddress from '../models/address.model';
import { createAccountHttp, getAccountTypeIdByName } from '../services/service';
import { logger } from '../config/logger';
import { normalizeCnpj } from '../utils/cnpjInRfb2229';

const DEFAULT_COMPANY_EMAIL = 'seed.empresa@demo.totalfretes.com.br';
const DEFAULT_COMPANY_PASSWORD = 'Empresa@123456';
const DEFAULT_COMPANY_CNPJ = '00000000000191';
const DEFAULT_COMPANY_NAME = 'Seed Transportes Demo Ltda';
const SEED_MARKER_EMAIL = 'seed.empresa@demo.totalfretes.com.br';

const DEFAULT_ADDRESS = {
	country: 'BR',
	cep: '01310100',
	street: 'Av. Paulista',
	district: 'Bela Vista',
	number: '500',
	city: 'São Paulo',
	state: 'SP',
};

function isSeedEnabled(): boolean {
	const raw = process.env.COMPANY_SEED_ENABLED?.trim().toLowerCase();
	if (raw === 'false' || raw === '0') return false;
	return true;
}

async function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createAccountWithRetry(
	data: Parameters<typeof createAccountHttp>[0],
	maxAttempts = 5,
): Promise<boolean> {
	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		const ok = await createAccountHttp(data);
		if (ok) return true;

		if (attempt < maxAttempts) {
			logger.warn(`Company seed: account creation attempt ${attempt} failed, retrying...`);
			await sleep(2000 * attempt);
		}
	}

	return false;
}

async function ensureCompanyAccount(
	company: Company,
	password: string,
	accountTypeId: number,
): Promise<boolean> {
	if (!company.id || !company.email) return false;

	if (!company.isPaid) {
		await company.markAsPaid();
		logger.info(`Default company id=${company.id} marked as paid`);
	}

	return createAccountWithRetry({
		email: company.email,
		password,
		subject_id: company.id,
		account_type_id: accountTypeId,
	});
}

export async function seedDefaultCompany(): Promise<void> {
	if (!isSeedEnabled()) {
		logger.info('Default company seed skipped (COMPANY_SEED_ENABLED=false)');
		return;
	}

	const email = (process.env.COMPANY_SEED_EMAIL?.trim() || DEFAULT_COMPANY_EMAIL).toLowerCase();
	const password = process.env.COMPANY_SEED_PASSWORD?.trim() || DEFAULT_COMPANY_PASSWORD;
	const companyAccountTypeId = await getAccountTypeIdByName('COMPANY');

	if (!companyAccountTypeId) {
		logger.warn('Default company seed skipped: COMPANY account type not found in authentication-service');
		return;
	}

	const existingById = await Company.findByPk(1);
	const existingByEmail = await Company.findOne({ where: { email } });
	const legacySeedCompany = await Company.findOne({
		where: { email: 'empresa@totalfretes.com.br' },
	});

	if (existingById && existingByEmail && existingById.id !== existingByEmail.id) {
		logger.warn('Default company seed skipped: company id=1 exists with a different email');
		return;
	}

	const existing = existingById ?? existingByEmail ?? legacySeedCompany;
	if (existing?.id) {
		const accountCreated = await ensureCompanyAccount(existing, password, companyAccountTypeId);

		if (accountCreated) {
			logger.info(`Default company account created for ${existing.email} (company id=${existing.id})`);
		} else {
			logger.info(`Default company already exists (id=${existing.id})`);
		}
		return;
	}

	const anyCompany = await Company.findOne();
	if (anyCompany) {
		logger.warn('Default company seed skipped: companies exist but id=1 is not available');
		return;
	}

	const cnpj = normalizeCnpj(process.env.COMPANY_SEED_CNPJ?.trim() || DEFAULT_COMPANY_CNPJ);
	const name = process.env.COMPANY_SEED_NAME?.trim() || DEFAULT_COMPANY_NAME;

	const address = await CompanyAddress.create(DEFAULT_ADDRESS);
	if (!address.id) {
		await address.destroy();
		logger.error('Default company seed failed: could not create address');
		return;
	}

	const company = await Company.create({
		name,
		email,
		birthFundation: new Date('2015-06-20'),
		phoneNumber: '11988887777',
		website: 'https://demo-transportes.example.com',
		cnpj,
		companyAddress_id: address.id,
		isPaid: true,
	});

	if (!company.id) {
		await company.destroy();
		await address.destroy();
		logger.error('Default company seed failed: could not create company');
		return;
	}

	const accountCreated = await createAccountWithRetry({
		email,
		password,
		subject_id: company.id,
		account_type_id: companyAccountTypeId,
	});

	if (!accountCreated) {
		await company.destroy();
		await address.destroy();
		logger.error('Default company seed failed: could not create account (is authentication-service running?)');
		return;
	}

	logger.info(`Default company created (id=${company.id}, email=${email}, marker=${SEED_MARKER_EMAIL})`);
}
