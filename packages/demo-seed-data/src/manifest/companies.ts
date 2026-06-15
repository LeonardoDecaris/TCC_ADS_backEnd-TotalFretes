import fs from 'fs';
import path from 'path';

export type DemoCompanyAddress = {
	country: string;
	cep: string;
	street: string;
	district: string;
	number: string;
	city: string;
	state: string;
};

export type DemoCompanySpec = {
	slug: string;
	name: string;
	cnpj: string;
	/** Nome do arquivo em uploads/company-images/ */
	logoFile: string;
	phoneNumber: string;
	website: string;
	birthFundation: string;
	address: DemoCompanyAddress;
	/** Tipos de carga típicos para fretes desta empresa */
	preferredCargoNames: string[];
};

const companiesFilePath = path.resolve(__dirname, 'data', 'companies.json');

const parseCompanies = (): DemoCompanySpec[] => {
	const raw = fs.readFileSync(companiesFilePath, 'utf8');
	return JSON.parse(raw) as DemoCompanySpec[];
};

export const DEMO_COMPANIES: DemoCompanySpec[] = parseCompanies();

export function getDemoCompanyBySlug(slug: string): DemoCompanySpec | undefined {
	return DEMO_COMPANIES.find((company) => company.slug === slug);
}
