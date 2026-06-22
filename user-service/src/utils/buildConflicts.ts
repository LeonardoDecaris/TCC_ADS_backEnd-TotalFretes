import User from '../models/user.model';
import { translation } from './i18n';
import type { ConflictDetail } from '../services/httpResponse';

const USER_UNIQUE_FIELDS = [
	{ field: 'email', messageKey: 'USER.EMAIL_ALREADY_EXISTS' },
	{ field: 'phoneNumber', messageKey: 'USER.PHONE_ALREADY_EXISTS' },
	{ field: 'cpf', messageKey: 'USER.CPF_ALREADY_EXISTS' },
	{ field: 'cnhNumber', messageKey: 'USER.CNH_NUMBER_ALREADY_EXISTS' },
] as const;

export type UserUniqueField = (typeof USER_UNIQUE_FIELDS)[number]['field'];

function normalizeUserFieldValue(field: UserUniqueField, value: unknown): string {
	if (typeof value !== 'string') return '';
	if (field === 'email') return value.trim().toLowerCase();
	return value.trim();
}

export async function buildUserConflicts(
	existing: User,
	body: Partial<Record<UserUniqueField, string>>,
	locale: string,
	fieldsToCheck?: UserUniqueField[],
): Promise<ConflictDetail[]> {
	const conflicts: ConflictDetail[] = [];

	for (const { field, messageKey } of USER_UNIQUE_FIELDS) {
		if (fieldsToCheck && !fieldsToCheck.includes(field)) continue;

		const bodyValue = body[field];
		if (bodyValue === undefined) continue;

		const existingValue = existing.getDataValue(field);
		if (
			normalizeUserFieldValue(field, bodyValue) ===
			normalizeUserFieldValue(field, existingValue)
		) {
			conflicts.push({
				field,
				message: await translation(messageKey, locale),
			});
		}
	}

	return conflicts;
}

export function buildUserUniqueConditions(
	body: Partial<Record<UserUniqueField, string>>,
): Array<Partial<Record<UserUniqueField, string>>> {
	const conditions: Array<Partial<Record<UserUniqueField, string>>> = [];

	if (body.email !== undefined) conditions.push({ email: body.email });
	if (body.phoneNumber !== undefined) conditions.push({ phoneNumber: body.phoneNumber });
	if (body.cpf !== undefined) conditions.push({ cpf: body.cpf });
	if (body.cnhNumber !== undefined) conditions.push({ cnhNumber: body.cnhNumber });

	return conditions;
}
