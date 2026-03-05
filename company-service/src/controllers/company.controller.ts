import { Request, Response } from "express";
import Company from "../models/company.model";
import { translation } from "../utils/i18n";
import { getLocaleFromRequest } from "../utils/locale";

export const createCompany = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const company = await Company.create(req.body);
		return res.status(201).json({
			message: await translation("COMPANY.CREATED_SUCCESSFULLY", locale),
			company,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation("COMPANY.CREATE_FAILED", locale),
		});
	}
};

export const getCompanyById = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const company = await Company.findByPk(req.params.id as string);
		if (!company) {
			return res.status(404).json({
				message: await translation("COMPANY.NOT_FOUND", locale),
			});
		}
		return res.status(200).json(company);
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation("COMPANY.GET_BY_ID_FAILED", locale),
		});
	}
};

export const getAllCompanies = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const company = await Company.findAll();
		return res.status(200).json(company);
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation("COMPANY.GET_ALL_FAILED", locale),
		});
	}
};

export const updateCompany = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const company = await Company.findByPk(req.params.id as string);
		if (!company) {
			return res.status(404).json({
				message: await translation("COMPANY.NOT_FOUND", locale),
			});
		}
		await company.update(req.body);
		return res.status(200).json({
			message: await translation("COMPANY.UPDATED_SUCCESSFULLY", locale),
			company,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation("COMPANY.UPDATE_FAILED", locale),
		});
	}
};

export const deleteCompany = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const company = await Company.findByPk(req.params.id as string);
		if (!company) {
			return res.status(404).json({
				message: await translation("COMPANY.NOT_FOUND", locale),
			});
		}
		await company.destroy();
		return res.status(200).json({
			message: await translation("COMPANY.DELETED_SUCCESSFULLY", locale),
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation("COMPANY.DELETE_FAILED", locale),
		});
	}
};

