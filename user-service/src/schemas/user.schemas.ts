import { z } from 'zod';
import validator from 'validator';
import { isCPF, isCNH } from 'validation-br';

const nameSchema = z
	.string()
	.min(1, 'Nome é obrigatório')
	.refine((v) => v.length > 2, 'Nome deve ter mais de 2 caracteres');

const emailSchema = z
	.string()
	.min(1, 'Email é obrigatório')
	.refine((v) => validator.isEmail(v), 'Email inválido');

const phoneSchema = z
	.string()
	.min(1, 'Telefone é obrigatório')
	.refine(
		(v) => validator.isMobilePhone(v, 'pt-BR'),
		'Telefone celular inválido (use formato brasileiro)'
	);

const cpfSchema = z
	.string()
	.min(1, 'CPF é obrigatório')
	.refine((v) => isCPF(v), 'CPF inválido');


const sexSchema = z
	.string()
	.min(1, 'Sexo é obrigatório')
	.refine((v) => ['M', 'F'].includes(v), 'Sexo inválido');


const useGlassesSchema = z
	.boolean()
	.refine((v) => v === true, 'Uso de lentes inválido');


const isDeficientSchema = z
	.boolean()
	.refine((v) => v === true, 'Deficiência inválida');

const cnhNumberSchema = z
	.string()
	.min(1, 'Número da CNH é obrigatório')
	.refine((v) => isCNH(v), 'Número da CNH inválido')

const cnhTypeSchema = z
	.number()
	.min(1, 'Tipo de CNH é obrigatório')
	.refine((v) => v > 0, 'Tipo de CNH inválido');

const vehicleTypeSchema = z
	.number()
	.min(1, 'Tipo de veículo é obrigatório')
	.refine((v) => v > 0, 'Tipo de veículo inválido');

const userImageSchema = z
	.number()
	.min(1, 'Imagem do usuário é obrigatória')
	.refine((v) => v > 0, 'Imagem do usuário inválida');

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
	password: z.string().min(1, 'Senha é obrigatória'),
	account_type_id: z.number(),
});
