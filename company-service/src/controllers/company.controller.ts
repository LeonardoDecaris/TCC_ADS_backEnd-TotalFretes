import { Request, Response } from "express";

import Company from "../models/company.model";

import CompanyAddress from "../models/address.model";

import { createAccountRpc } from "../messaging/account.rpc";

import { isSuccess, isError } from "../shared/rpc.types";

import { translation } from "../utils/i18n";

import { getLocaleFromRequest } from "../utils/locale";

import {

	createCompanySchema,

	createCompanyEndAccountSchema,

	updateCompanySchema,

} from "../schemas/company.schemas";



export const createCompany = async (req: Request, res: Response) => {

	const locale = getLocaleFromRequest(req);

	try {

		const body = createCompanySchema.parse(req.body);



		const company = await Company.create(body);

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

		const body = updateCompanySchema.parse(req.body);



		const company = await Company.findByPk(req.params.id as string);

		if (!company) {

			return res.status(404).json({

				message: await translation("COMPANY.NOT_FOUND", locale),

			});

		}

		await company.update(body);

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



export const createCompanyEndAccount = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const body = createCompanyEndAccountSchema.parse(req.body);

		const exeistCompany = await Company.findOne({
			where: { email: body.email, },
		});
		if (exeistCompany) {
			return res.status(400).json({
				error: 'email_already_exists',
				message: await translation("COMPANY.EMAIL_ALREADY_EXISTS", locale),
			});
		}


		const address = await CompanyAddress.create(body);
		if (!address.id) {
			await address.destroy();
			return res.status(500).json({
				message: await translation("COMPANY.CREATE_FAILED", locale),
			});
		}

		const company = await Company.create(body);
		if (!company.id) {
			console.log(company);
			await company.destroy();
			return res.status(500).json({
				message: await translation("COMPANY.CREATE_FAILED", locale),
			});
		}

		if (!company.id) {
			await company.destroy();
			await address.destroy();
			return res.status(500).json({
				message: await translation("COMPANY.CREATE_FAILED", locale),
			});
		}

		const account = await createAccountRpc({
			email: body.email,
			password: body.password,
			subject_id: company.id,
			account_type_id: body.account_type_id,
		});

		if (!isSuccess(account)) {
			await company.destroy();
			await address.destroy();
			return res.status(500).json({
				message: await translation("COMPANY.CREATE_FAILED", locale),
			});
		}

		return res.status(201).json({
			message: await translation("COMPANY.CREATED_WITH_ACCOUNT_SUCCESSFULLY", locale),
			company,
			address,
		});

	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation("COMPANY.CREATE_FAILED", locale),
		});
	}
};
