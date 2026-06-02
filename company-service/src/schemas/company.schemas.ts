import { z } from "zod";
import validator from "validator";
import { isValidCnpjInRfb2229, normalizeCnpj } from "../utils/cnpjInRfb2229";

const normalizePhoneNumber = (value: string) => value.replace(/\D/g, "");

const isValidInternationalPhoneNumber = (value: string) => {
	const digits = normalizePhoneNumber(value);

	if (!/^\d{8,15}$/.test(digits)) {
		return false;
	}

	return true;
};

const nameSchema = z
	.string()
	.min(1, "VALIDATION.NAME_REQUIRED")
	.refine((v) => v.length > 2, "VALIDATION.NAME_MIN_LENGTH");

const emailSchema = z
	.string()
	.min(1, "VALIDATION.EMAIL_REQUIRED")
	.refine((v) => validator.isEmail(v), "VALIDATION.EMAIL_INVALID");

const birthFundationSchema = z
	.string()
	.min(1, "VALIDATION.BIRTH_FUNDATION_REQUIRED");

const phoneNumberSchema = z
	.string()
	.min(1, "VALIDATION.PHONE_REQUIRED")
	.transform((v) => normalizePhoneNumber(v))
	.refine(
		(v) => isValidInternationalPhoneNumber(v),
		"VALIDATION.PHONE_INVALID"
	);

const websiteSchema = z
	.string()
	.url("VALIDATION.WEBSITE_INVALID")
	.optional()
	.or(z.literal("").transform(() => undefined));

const cnpjSchema = z
	.string()
	.min(1, "VALIDATION.CNPJ_REQUIRED")
	.transform((v) => normalizeCnpj(v))
	.refine((v) => isValidCnpjInRfb2229(v), "VALIDATION.CNPJ_INVALID");

const companyImageIdSchema = z
	.number()
	.int("VALIDATION.COMPANY_IMAGE_INT")
	.positive("VALIDATION.COMPANY_IMAGE_POSITIVE")
	.optional();

const companyAddressIdSchema = z
	.number()
	.int("VALIDATION.COMPANY_ADDRESS_INT")
	.positive("VALIDATION.COMPANY_ADDRESS_POSITIVE")
	.optional();

const baseCompanyFields = {
	name: nameSchema,
	email: emailSchema,
	birthFundation: birthFundationSchema,
	phoneNumber: phoneNumberSchema,
	website: websiteSchema,
	cnpj: cnpjSchema,
	company_image_id: companyImageIdSchema,
	companyAddress_id: companyAddressIdSchema,
};

export const createCompanySchema = z.object(baseCompanyFields);

export const updateCompanySchema = z.object(baseCompanyFields).partial();

export const createCompanyAddressSchema = z.object({
	country: z.string().min(1, "VALIDATION.COUNTRY_REQUIRED"),
	cep: z.string().min(1, "VALIDATION.CEP_REQUIRED"),
	street: z.string().min(1, "VALIDATION.STREET_REQUIRED"),
	district: z.string().min(1, "VALIDATION.DISTRICT_REQUIRED"),
	number: z.string().min(1, "VALIDATION.NUMBER_REQUIRED"),
	city: z.string().min(1, "VALIDATION.CITY_REQUIRED"),
	state: z.string().min(1, "VALIDATION.STATE_REQUIRED"),
});

export const updateCompanyAddressSchema = createCompanyAddressSchema.partial();

/** Cadastro completo: dados da empresa + endereço + senha + tipo de conta (POST /company/end-account). */
export const createCompanyEndAccountSchema = createCompanySchema
	.omit({ companyAddress_id: true })
	.merge(createCompanyAddressSchema)
	.extend({
		password: z.string().min(1, "VALIDATION.PASSWORD_REQUIRED"),
		account_type_id: z.coerce
			.number()
			.positive("VALIDATION.ACCOUNT_TYPE_INVALID"),
	});

export const paymentTokenRequestSchema = z.object({
	email: emailSchema,
});
