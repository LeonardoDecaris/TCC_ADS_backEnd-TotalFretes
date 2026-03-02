import { Request, Response } from "express";
import CompanyAddress from "../models/address.model";
import { translation } from "../utils/i18n";
import { tr } from "zod/locales";

const getLocaleFromRequest = (req: Request): string => {
    const xLocale = req.headers["x-locale"];
    if (typeof xLocale === "string" && xLocale.trim()) return xLocale;

    const acceptLanguage = req.headers["accept-language"];
    if (typeof acceptLanguage === "string" && acceptLanguage.trim()) {
        return acceptLanguage.split(",")[0].trim();
    }

    return "pt-BR";
};

export const createCompanyAddress = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const companyAddress = await CompanyAddress.create(req.body);
		return res.status(201).json({ message: translation("COMPANY_ADDRESS.CREATED_SUCCESSFULLY", locale), companyAddress });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: translation("COMPANY_ADDRESS.CREATE_FAILED", locale) });
	}
};

export const getAllCompanyAddresses = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const companyAddresses = await CompanyAddress.findAll();
		return res.status(200).json(companyAddresses);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: translation("COMPANY_ADDRESS.GET_ALL_FAILED", locale) });
	}
};

export const getCompanyAddressById = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const companyAddress = await CompanyAddress.findByPk(req.params.id as string);
		if (!companyAddress) {
			return res.status(404).json({ message: translation("COMPANY_ADDRESS.NOT_FOUND", locale) });
		}
		return res.status(200).json(companyAddress);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: translation("COMPANY_ADDRESS.GET_BY_ID_FAILED", locale) });
	}
};

export const updateCompanyAddress = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const companyAddress = await CompanyAddress.findByPk(req.params.id as string);
		if (!companyAddress) {
			return res.status(404).json({ message: translation("COMPANY_ADDRESS.NOT_FOUND", locale) });
		}
		await companyAddress.update(req.body);
		return res.status(200).json({ message: translation("COMPANY_ADDRESS.UPDATED_SUCCESSFULLY", locale), companyAddress });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: translation("COMPANY_ADDRESS.UPDATE_FAILED", locale) });
	}
};

export const deleteCompanyAddress = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const companyAddress = await CompanyAddress.findByPk(req.params.id as string);
		if (!companyAddress) {
			return res.status(404).json({ message: translation("COMPANY_ADDRESS.NOT_FOUND", locale) });
		}
		await companyAddress.destroy();
		return res.status(200).json({ message: translation("COMPANY_ADDRESS.DELETED_SUCCESSFULLY", locale) });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: translation("COMPANY_ADDRESS.DELETE_FAILED", locale) });
	}
};