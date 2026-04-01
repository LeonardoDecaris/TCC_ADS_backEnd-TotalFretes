import { z } from 'zod';
import validator from 'validator';
import { isCPF, isCNH } from 'validation-br';

// ─── Primitivos reutilizáveis ────────────────────────────────────────────────

const booleanFromInputSchema = z.preprocess((value) => {
	if (typeof value === 'string') {
		const normalized = value.trim().toLowerCase();
		if (normalized === 'true' || normalized === '1') return true;
		if (normalized === 'false' || normalized === '0') return false;
	}
	return value;
}, z.boolean());


const optionalPositiveNumberSchema = (invalidMessage: string) =>
	z.preprocess(
		(value) =>
			value === '' || value === null || value === undefined ? undefined : value,
		z.coerce
			.number()
			.positive(invalidMessage)
			.optional()
	);

// ─── Schemas de campos ───────────────────────────────────────────────────────

const nameSchema = z
	.string()
	.min(1, 'VALIDATION.NAME_REQUIRED')
	.min(3, 'VALIDATION.NAME_MIN_LENGTH');

const emailSchema = z
	.string()
	.min(1, 'VALIDATION.EMAIL_REQUIRED')
	.refine((v) => validator.isEmail(v), 'VALIDATION.EMAIL_INVALID');

const birthDateSchema = z
	.string()
	.min(1, 'VALIDATION.BIRTHDATE_REQUIRED')
	.refine(
		(v) => /^\d{8}$/.test(v.replace(/-/g, '')),
		'VALIDATION.BIRTHDATE_INVALID'
	);

const phoneSchema = z
	.string()
	.min(1, 'VALIDATION.PHONE_REQUIRED')
	.refine(
		(v) => validator.isMobilePhone(v, 'pt-BR'),
		'VALIDATION.PHONE_INVALID'
	);

const cpfSchema = z
	.string()
	.min(1, 'VALIDATION.CPF_REQUIRED')
	.refine((v) => isCPF(v), 'VALIDATION.CPF_INVALID');

const sexSchema = z
	.string()
	.min(1, 'VALIDATION.SEX_REQUIRED')
	.refine((v): v is 'M' | 'F' => ['M', 'F'].includes(v), 'VALIDATION.SEX_INVALID');

const cnhNumberSchema = z
	.string()
	.min(1, 'VALIDATION.CNH_NUMBER_REQUIRED')
	.refine((v) => isCNH(v), 'VALIDATION.CNH_NUMBER_INVALID');


const cnhTypeSchema = z.coerce
	.number({ error: 'VALIDATION.CNH_TYPE_REQUIRED' })
	.positive('VALIDATION.CNH_TYPE_INVALID');

const issuingAgencyCnhSchema = z
	.string()
	.max(100, 'VALIDATION.ISSUING_AGENCY_MAX_LENGTH')
	.optional();

const vehicleTypeSchema = optionalPositiveNumberSchema('VALIDATION.VEHICLE_TYPE_INVALID');
const vehicleIdSchema = optionalPositiveNumberSchema('VALIDATION.VEHICLE_ID_INVALID');
const userImageSchema = optionalPositiveNumberSchema('VALIDATION.USER_IMAGE_INVALID');

// ─── Campos base compartilhados ──────────────────────────────────────────────

const baseUserFields = {
	name: nameSchema,
	email: emailSchema,
	birthDate: birthDateSchema,
	phoneNumber: phoneSchema,
	cpf: cpfSchema,
	sex: sexSchema,
	useGlasses: booleanFromInputSchema,
	isDeficient: booleanFromInputSchema,
	cnhNumber: cnhNumberSchema,
	issuingAgencyCnh: issuingAgencyCnhSchema,
	cnhType_id: cnhTypeSchema,
	vehicle_id: vehicleIdSchema,
	vehicleType_id: vehicleTypeSchema,
	userImage_id: userImageSchema,
} as const;

// ─── Schemas exportados ──────────────────────────────────────────────────────

export const createUserSchema = z.object(baseUserFields);

export const updateUserSchema = z.object(baseUserFields).partial();

export const createUserEndAccountSchema = z.object({
	...baseUserFields,
	password: z.string().min(1, 'VALIDATION.PASSWORD_REQUIRED'),
	account_type_id: z.coerce.number().positive('VALIDATION.ACCOUNT_TYPE_INVALID'),
});

// ─── Tipos inferidos ─────────────────────────────────────────────────────────

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateUserEndAccountInput = z.infer<typeof createUserEndAccountSchema>;