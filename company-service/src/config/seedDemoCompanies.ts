import {
	DEFAULT_DEMO_COMPANY_PASSWORD,
	demoCompanyEmail,
	isDemoCompanyEmail,
	isDemoSeedEnabled,
} from '@total-fretes/demo-seed-data';

import { DEMO_COMPANIES } from './companies.constants';

import Company from '../models/company.model';
import CompanyAddress from '../models/address.model';
import { createAccountHttp, getAccountTypeIdByName, registerDemoCompanyImageHttp } from '../services/service';
import { logger } from '../config/logging';

async function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createAccountWithRetry(
	data: Parameters<typeof createAccountHttp>[0],
	maxAttempts = 5,
): Promise<boolean> {
	for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
		const ok = await createAccountHttp(data);
		if (ok) return true;
		if (attempt < maxAttempts) {
			logger.warn(`Demo company seed: account attempt ${attempt} failed, retrying...`);
			await sleep(2000 * attempt);
		}
	}
	return false;
}

async function ensureCompanyAccount(company: Company, password: string, accountTypeId: number): Promise<void> {
	if (!company.id || !company.email) return;

	if (!company.isPaid) {
		await company.markAsPaid();
	}

	await createAccountWithRetry({
		email: company.email,
		password,
		subject_id: company.id,
		account_type_id: accountTypeId,
	});
}

async function ensureCompanyLogo(company: Company, logoFile: string): Promise<void> {
	if (!company.id) return;

	const image = await registerDemoCompanyImageHttp({
		companyId: company.id,
		logoFile,
	});

	if (image?.id && company.company_image_id !== image.id) {
		await company.update({ company_image_id: image.id });
	}
}

export async function seedDemoCompanies(): Promise<{ created: number; updated: number }> {
	if (!isDemoSeedEnabled()) {
		logger.info('Demo companies seed skipped (DEMO_DATA_SEED_ENABLED=false)');
		return { created: 0, updated: 0 };
	}

	const password = process.env.DEMO_SEED_PASSWORD?.trim() || DEFAULT_DEMO_COMPANY_PASSWORD;
	const companyAccountTypeId = await getAccountTypeIdByName('COMPANY');

	if (!companyAccountTypeId) {
		logger.warn('Demo companies seed skipped: COMPANY account type not found');
		return { created: 0, updated: 0 };
	}

	let created = 0;
	let updated = 0;

	for (const spec of DEMO_COMPANIES) {
		try {
			const email = demoCompanyEmail(spec.slug).toLowerCase();
			let company = await Company.findOne({ where: { email } });

			if (!company) {
				const address = await CompanyAddress.create(spec.address);
				if (!address.id) {
					await address.destroy();
					logger.error(`Demo company seed failed: address for ${spec.slug}`);
					continue;
				}

				company = await Company.create({
					name: spec.name,
					email,
					birthFundation: new Date(spec.birthFundation),
					phoneNumber: spec.phoneNumber,
					website: spec.website,
					cnpj: spec.cnpj,
					companyAddress_id: address.id,
					isPaid: true,
				});

				if (!company.id) {
					await company.destroy();
					await address.destroy();
					logger.error(`Demo company seed failed: company ${spec.slug}`);
					continue;
				}

				created += 1;
			} else {
				await company.update({
					name: spec.name,
					phoneNumber: spec.phoneNumber,
					website: spec.website,
					cnpj: spec.cnpj,
				});
				updated += 1;
			}

			await ensureCompanyAccount(company, password, companyAccountTypeId);
			await ensureCompanyLogo(company, spec.logoFile);
		} catch (error) {
			logger.error(`Demo company seed failed for ${spec.slug}`, error);
		}
	}

	logger.info(`Demo companies seed completed (created=${created}, updated=${updated})`);
	return { created, updated };
}

export async function listDemoCompaniesForSeed(): Promise<Array<{ id: number; email: string; slug: string }>> {
	const companies = await Company.findAll({ attributes: ['id', 'email', 'name'] });
	return companies
		.filter((company) => company.email && isDemoCompanyEmail(company.email))
		.map((company) => {
			const email = company.email!.toLowerCase();
			const atIndex = email.indexOf('@');
			const slug = email.slice('demo.'.length, atIndex);
			return { id: company.id!, email, slug };
		});
}
