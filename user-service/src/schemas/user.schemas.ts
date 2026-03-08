import { z } from 'zod';
import validator from 'validator';
import { isCPF, isCNH } from 'validation-br';

const nameSchema = z
	.string()
	.min(1, 'VALIDATION.NAME_REQUIRED')
	.refine((v) => v.length > 2, 'VALIDATION.NAME_MIN_LENGTH');

const emailSchema = z
	.string()
	.min(1, 'VALIDATION.EMAIL_REQUIRED')
	.refine((v) => validator.isEmail(v), 'VALIDATION.EMAIL_INVALID');

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
	.refine((v) => ['M', 'F'].includes(v), 'VALIDATION.SEX_INVALID');

const useGlassesSchema = z
	.boolean()
	.refine((v) => v === true, 'VALIDATION.USE_GLASSES_INVALID');

const isDeficientSchema = z
	.boolean()
	.refine((v) => v === true, 'VALIDATION.IS_DEFICIENT_INVALID');

const cnhNumberSchema = z
	.string()
	.min(1, 'VALIDATION.CNH_NUMBER_REQUIRED')
	.refine((v) => isCNH(v), 'VALIDATION.CNH_NUMBER_INVALID');

const cnhTypeSchema = z
	.number()
	.min(1, 'VALIDATION.CNH_TYPE_REQUIRED')
	.refine((v) => v > 0, 'VALIDATION.CNH_TYPE_INVALID');

const vehicleTypeSchema = z
	.number()
	.min(1, 'VALIDATION.VEHICLE_TYPE_REQUIRED')
	.refine((v) => v > 0, 'VALIDATION.VEHICLE_TYPE_INVALID');

const userImageSchema = z
	.number()
	.min(1, 'VALIDATION.USER_IMAGE_REQUIRED')
	.refine((v) => v > 0, 'VALIDATION.USER_IMAGE_INVALID');

const baseUserFields = {
	name: nameSchema,
	email: emailSchema,
	phoneNumber: phoneSchema,
	cpf: cpfSchema,
	sex: sexSchema,
	useGlasses: useGlassesSchema,
	isDeficient: isDeficientSchema,
	cnhNumber: cnhNumberSchema,
	cnhType_id: cnhTypeSchema,
	vehicleType_id: vehicleTypeSchema,
	userImage_id: userImageSchema,
};

export const createUserSchema = z.object(baseUserFields);

export const updateUserSchema = z.object(baseUserFields);

export const createUserEndAccountSchema = z.object({
	...baseUserFields,
	password: z.string().min(1, 'VALIDATION.PASSWORD_REQUIRED'),
	account_type_id: z.number(),
});
