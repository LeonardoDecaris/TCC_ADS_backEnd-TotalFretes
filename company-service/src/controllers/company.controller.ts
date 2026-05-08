import { Request, Response } from "express";
import { Op } from "sequelize";
import Company from "../models/company.model";
import CompanyAddress from "../models/address.model";
import { createAccountHttp } from "../services/service";
import { translation } from "../utils/i18n";
import { getLocaleFromRequest } from "../utils/locale";
import { sendError, sendConflictError } from "../services/httpResponse";
import { handleZodError } from "../utils/zodError";

import {
	createCompanySchema,
	createCompanyEndAccountSchema,
	updateCompanySchema,
} from "../schemas/company.schemas";

export const createCompany = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const body = createCompanySchema.parse(req.body);

		const existingCompany = await Company.findOne({
			where: {
				[Op.or]: [{
					email: body.email,
					cnpj: body.cnpj,
					phoneNumber: body.phoneNumber,
				}],
			},
		});
		if (existingCompany) {
			return sendConflictError(res, "COMPANY.ALREADY_EXISTS", locale, [{
				field: "email",
				message: await translation("COMPANY.EMAIL_ALREADY_EXISTS", locale),
			}, {
				field: "cnpj",
				message: await translation("COMPANY.CNPJ_ALREADY_EXISTS", locale),
			}, {
				field: "phoneNumber",
				message: await translation("COMPANY.PHONE_NUMBER_ALREADY_EXISTS", locale),
			}]);
		}

		const company = await Company.create(body);
		return res.status(201).json({
			message: await translation("COMPANY.CREATED_SUCCESSFULLY", locale),
			company,
		});
	} catch (error) {
		if (await handleZodError(error, locale, res)) return;
		return sendError(res, 500, "COMPANY.CREATE_FAILED", locale);
	}
};

export const getCompanyById = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const company = await Company.findByPk(req.params.id as string);
		if (!company) {
			return sendError(res, 404, "COMPANY.NOT_FOUND", locale);
		}
		return res.status(200).json(company);
	} catch (error) {
		return sendError(res, 500, "COMPANY.GET_BY_ID_FAILED", locale);
	}
};

export const getAllCompanies = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const company = await Company.findAll();
		return res.status(200).json(company);
	} catch (error) {
		return sendError(res, 500, "COMPANY.GET_ALL_FAILED", locale);
	}
};

export const updateCompany = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const body = updateCompanySchema.parse(req.body);

		const company = await Company.findByPk(req.params.id as string);
		if (!company) {
			return sendError(res, 404, "COMPANY.NOT_FOUND", locale);
		}

		await company.update(body);
		return res.status(200).json({
			message: await translation("COMPANY.UPDATED_SUCCESSFULLY", locale),
			company,
		});
	} catch (error) {
		if (await handleZodError(error, locale, res)) return;
		return sendError(res, 500, "COMPANY.UPDATE_FAILED", locale);
	}
};

export const deleteCompany = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const company = await Company.findByPk(req.params.id as string);
		if (!company) {
			return sendError(res, 404, "COMPANY.NOT_FOUND", locale);
		}

		await company.destroy();
		return res.status(200).json({
			message: await translation("COMPANY.DELETED_SUCCESSFULLY", locale),
		});
	} catch (error) {
		return sendError(res, 500, "COMPANY.DELETE_FAILED", locale);
	}
};

export const createCompanyEndAccount = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const body = createCompanyEndAccountSchema.parse(req.body);

		const existingCompany = await Company.findOne({
			where: {
				[Op.or]: [{ email: body.email }, { cnpj: body.cnpj }, { phoneNumber: body.phoneNumber }],
			},
		});
		if (existingCompany) return sendConflictError(res, 'USER.ALREADY_EXISTS', locale, [{
			field: 'email',
			message: await translation('USER.EMAIL_ALREADY_EXISTS', locale),
		}, {
			field: 'cnpj',
			message: await translation('USER.CNPJ_ALREADY_EXISTS', locale),
		}, {
			field: 'phoneNumber',
			message: await translation('USER.PHONE_NUMBER_ALREADY_EXISTS', locale),
		}]);


		const address = await CompanyAddress.create(body);
		if (!address.id) {
			await address.destroy();
			return sendError(res, 500, "COMPANY.CREATE_FAILED", locale);
		}

		const company = await Company.create(body);
		if (!company.id) {
			await company.destroy();
			await address.destroy();
			return sendError(res, 500, "COMPANY.CREATE_FAILED", locale);
		}

		const accountCreated = await createAccountHttp({
			email: body.email,
			password: body.password,
			subject_id: company.id,
			account_type_id: body.account_type_id,
		});

		if (!accountCreated) {
			await company.destroy();
			await address.destroy();
			return sendError(res, 500, "COMPANY.CREATE_FAILED", locale);
		}

		return res.status(201).json({
			message: await translation("COMPANY.CREATED_WITH_ACCOUNT_SUCCESSFULLY", locale),
			company,
			address,
		});

	} catch (error) {
		if (await handleZodError(error, locale, res)) return;
		return sendError(res, 500, "COMPANY.CREATE_FAILED", locale);
	}
};
