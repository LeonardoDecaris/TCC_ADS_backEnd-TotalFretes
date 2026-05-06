import { Request, Response } from "express";
import CompanyAddress from "../models/address.model";
import { translation } from "../utils/i18n";
import { getLocaleFromRequest } from "../utils/locale";
import {
	createCompanyAddressSchema,
	updateCompanyAddressSchema,
} from "../schemas/company.schemas";
import { sendError } from "../utils/httpResponse";
import { handleZodError } from "../utils/zodError";

export const createCompanyAddress = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const body = createCompanyAddressSchema.parse(req.body);

		const companyAddress = await CompanyAddress.create(body);
		return res.status(201).json({
			message: await translation("COMPANY_ADDRESS.CREATED_SUCCESSFULLY", locale),
			companyAddress,
		});
	} catch (error) {
		const zodError = await handleZodError(error, locale);
		if (zodError) return res.status(zodError.status).json(zodError.body);
		console.error(error);
		return sendError(res, 500, await translation("COMPANY_ADDRESS.CREATE_FAILED", locale));
	}
};

export const getAllCompanyAddresses = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const companyAddresses = await CompanyAddress.findAll();
		return res.status(200).json(companyAddresses);
	} catch (error) {
		console.error(error);
		return sendError(res, 500, await translation("COMPANY_ADDRESS.GET_ALL_FAILED", locale));
	}
};

export const getCompanyAddressById = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const companyAddress = await CompanyAddress.findByPk(req.params.id as string);
		if (!companyAddress) {
			return sendError(res, 404, await translation("COMPANY_ADDRESS.NOT_FOUND", locale));
		}
		return res.status(200).json(companyAddress);
	} catch (error) {
		console.error(error);
		return sendError(res, 500, await translation("COMPANY_ADDRESS.GET_BY_ID_FAILED", locale));
	}
};

export const updateCompanyAddress = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const body = updateCompanyAddressSchema.parse(req.body);

		const companyAddress = await CompanyAddress.findByPk(req.params.id as string);
		if (!companyAddress) {
			return sendError(res, 404, await translation("COMPANY_ADDRESS.NOT_FOUND", locale));
		}
		await companyAddress.update(body);
		return res.status(200).json({
			message: await translation("COMPANY_ADDRESS.UPDATED_SUCCESSFULLY", locale),
			companyAddress,
		});
	} catch (error) {
		const zodError = await handleZodError(error, locale);
		if (zodError) return res.status(zodError.status).json(zodError.body);
		console.error(error);
		return sendError(res, 500, await translation("COMPANY_ADDRESS.UPDATE_FAILED", locale));
	}
};

export const deleteCompanyAddress = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const companyAddress = await CompanyAddress.findByPk(req.params.id as string);
		if (!companyAddress) {
			return sendError(res, 404, await translation("COMPANY_ADDRESS.NOT_FOUND", locale));
		}
		await companyAddress.destroy();
		return res.status(200).json({
			message: await translation("COMPANY_ADDRESS.DELETED_SUCCESSFULLY", locale),
		});
	} catch (error) {
		console.error(error);
		return sendError(res, 500, await translation("COMPANY_ADDRESS.DELETE_FAILED", locale));
	}
};
