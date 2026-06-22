import Company from '../models/company.model';
import { translation } from './i18n';
import type { ConflictDetail } from '../services/httpResponse';

const COMPANY_UNIQUE_FIELDS = [
	{ field: 'email', messageKey: 'COMPANY.EMAIL_ALREADY_EXISTS' },
	{ field: 'cnpj', messageKey: 'COMPANY.CNPJ_ALREADY_EXISTS' },
	{ field: 'phoneNumber', messageKey: 'COMPANY.PHONE_NUMBER_ALREADY_EXISTS' },
] as const;

export type CompanyUniqueField = (typeof COMPANY_UNIQUE_FIELDS)[number]['field'];

function normalizeCompanyFieldValue(field: CompanyUniqueField, value: unknown): string {
	if (typeof value !== 'string') return '';
	if (field === 'email') return value.trim().toLowerCase();
	return value.trim();
}

export async function buildCompanyConflicts(
	existing: Company,
	body: Partial<Record<CompanyUniqueField, string>>,
	locale: string,
	fieldsToCheck?: CompanyUniqueField[],
): Promise<ConflictDetail[]> {
	const conflicts: ConflictDetail[] = [];

	for (const { field, messageKey } of COMPANY_UNIQUE_FIELDS) {
		if (fieldsToCheck && !fieldsToCheck.includes(field)) continue;

		const bodyValue = body[field];
		if (bodyValue === undefined) continue;

		const existingValue = existing.getDataValue(field);
		if (
			normalizeCompanyFieldValue(field, bodyValue) ===
			normalizeCompanyFieldValue(field, existingValue)
		) {
			conflicts.push({
				field,
				message: await translation(messageKey, locale),
			});
		}
	}

	return conflicts;
}

export function buildCompanyUniqueConditions(
	body: Partial<Record<CompanyUniqueField, string>>,
): Array<Partial<Record<CompanyUniqueField, string>>> {
	const conditions: Array<Partial<Record<CompanyUniqueField, string>>> = [];

	if (body.email !== undefined) conditions.push({ email: body.email });
	if (body.cnpj !== undefined) conditions.push({ cnpj: body.cnpj });
	if (body.phoneNumber !== undefined) conditions.push({ phoneNumber: body.phoneNumber });

	return conditions;
}
