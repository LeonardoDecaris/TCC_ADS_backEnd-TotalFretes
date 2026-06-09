import { z } from 'zod';

const booleanFromInputSchema = z.preprocess((value) => {
	if (typeof value === 'string') {
		const normalized = value.trim().toLowerCase();
		if (normalized === 'true' || normalized === '1') return true;
		if (normalized === 'false' || normalized === '0') return false;
	}
	return value;
}, z.boolean());

const nameSchema = z.string().min(3, { message: 'VALIDATION.NAME_MIN_LENGTH' });
const emailSchema = z.string().email({ message: 'VALIDATION.EMAIL_INVALID' });
const birthDateSchema = z.string({ message: 'VALIDATION.BIRTHDATE_INVALID' });
const phoneSchema = z.string({ message: 'VALIDATION.PHONE_INVALID' });
const cpfSchema = z.string({ message: 'VALIDATION.CPF_INVALID' });
const sexSchema = z.string({ message: 'VALIDATION.SEX_INVALID' });
const cnhNumberSchema = z.string({ message: 'VALIDATION.CNH_NUMBER_INVALID' });
const cnhTypeSchema = z.coerce.number().positive({ message: 'VALIDATION.CNH_TYPE_INVALID' });
const issuingAgencyCnhSchema = z.string().max(100, { message: 'VALIDATION.ISSUING_AGENCY_MAX_LENGTH' }).optional();
const vehicleTypeSchema = z.number().positive({ message: 'VALIDATION.VEHICLE_TYPE_INVALID' }).optional();
const vehicleIdSchema = z.number().positive({ message: 'VALIDATION.VEHICLE_ID_INVALID' }).optional();
const userImageSchema = z.number().positive({ message: 'VALIDATION.USER_IMAGE_INVALID' }).optional();

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

const updateUserFields = {
	name: nameSchema,
	email: emailSchema,
	birthDate: birthDateSchema,
	phoneNumber: phoneSchema,
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

export const createUserSchema = z.object(baseUserFields);

export const updateUserSchema = z.object(updateUserFields).partial().strict();

export const createUserEndAccountSchema = z.object({
	...baseUserFields,
	password: z.string().min(1, 'VALIDATION.PASSWORD_REQUIRED'),
	account_type_id: z.coerce.number().positive('VALIDATION.ACCOUNT_TYPE_INVALID'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateUserEndAccountInput = z.infer<typeof createUserEndAccountSchema>;
