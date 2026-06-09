import axios from "axios";
import { Request, Response } from "express";
import { Op } from "sequelize";
import sequelize from "../config/database";
import Company from "../models/company.model";
import CompanyAddress from "../models/address.model";
import {
	createAccountHttp,
	deleteOwnAccountBySubjectHttp,
	deleteCompanyImageHttp,
	getAuthenticatedCompanyFreightsHttp,
	getCompanyImageHttp,
	type StorageImageData,
	uploadCompanyImageHttp,
	updateCompanyImageHttp,
} from "../services/service";
import { FreightStatusSlug } from "../config/freightStatus.constants";
import { translation } from "../utils/i18n";
import { getLocaleFromRequest } from "../utils/locale";
import { sendError, sendConflictError } from "../services/httpResponse";
import { handleZodError } from "../utils/zodError";
import { validateCompanyLogoPng } from "../utils/validateCompanyLogoPng";
import { logger } from "../config/logging";
import { logError } from "@total-fretes/logging";

import {
	createCompanySchema,
	createCompanyEndAccountSchema,
	updateCompanySchema,
	paymentTokenRequestSchema,
} from "../schemas/company.schemas";

type RequestWithFile = Request & {
	file?: Express.Multer.File;
};

const companyWithAddressInclude = [
	{
		model: CompanyAddress,
		attributes: ["id", "country", "cep", "street", "district", "number", "city", "state"],
		required: false,
	},
];

async function findCompanyWithAddress(id: string) {
	return Company.findByPk(id, {
		include: companyWithAddressInclude,
	});
}

function companyImageResponse(image: StorageImageData | null) {
	if (!image) return null;

	return {
		id: image.id,
		originalName: image.originalName ?? null,
		fileName: image.fileName ?? null,
		mimeType: image.mimeType ?? null,
		sizeBytes: image.sizeBytes ?? null,
		url: image.url ?? null,
	};
}

async function hydrateCompanyImage(company: Company) {
	if (!company.company_image_id) return null;
	return getCompanyImageHttp({ id: company.company_image_id });
}

async function buildCompanyResponse(company: Company) {
	const image = await hydrateCompanyImage(company);

	return {
		...company.toJSON(),
		CompanyImage: companyImageResponse(image),
	};
}

async function companyOwnsImage(companyId: number, imageId: number) {
	const image = await getCompanyImageHttp({ id: imageId });

	if (!image) return false;

	return Number(image.companyId) === companyId;
}

function isTerminalFreightStatus(statusName?: string | null) {
	const terminalStatuses = new Set<string>([
		FreightStatusSlug.CANCELADO,
		FreightStatusSlug.ENTREGUE,
		FreightStatusSlug.CONCLUIDO,
	]);

	return statusName != null && terminalStatuses.has(statusName);
}

async function countActiveCompanyFreights(req: Request) {
	const freights = await getAuthenticatedCompanyFreightsHttp({
		authorization: req.headers.authorization,
		locale: getLocaleFromRequest(req),
	});

	return freights.filter((freight) => !isTerminalFreightStatus(freight.status?.name ?? null)).length;
}

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
		return sendError(res, 500, "COMPANY.CREATE_FAILED", locale, error);
	}
};

export const getCompanyById = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const company = await findCompanyWithAddress(req.params.id as string);
		if (!company) {
			return sendError(res, 404, "COMPANY.NOT_FOUND", locale);
		}
		return res.status(200).json(await buildCompanyResponse(company));
	} catch (error) {
		return sendError(res, 500, "COMPANY.GET_BY_ID_FAILED", locale, error);
	}
};

export const getAllCompanies = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const company = await Company.findAll();
		return res.status(200).json(company);
	} catch (error) {
		return sendError(res, 500, "COMPANY.GET_ALL_FAILED", locale, error);
	}
};

export const updateCompany = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		if (Object.prototype.hasOwnProperty.call(req.body, "cnpj")) {
			return sendError(res, 400, "COMPANY.CNPJ_UPDATE_NOT_ALLOWED", locale);
		}

		const body = updateCompanySchema.parse(req.body);

		const company = await findCompanyWithAddress(req.params.id as string);
		if (!company) {
			return sendError(res, 404, "COMPANY.NOT_FOUND", locale);
		}

		if (
			body.company_image_id !== undefined &&
			!(await companyOwnsImage(Number(company.id), body.company_image_id))
		) {
			return sendError(res, 403, "COMPANY_IMAGE.INVALID_OWNERSHIP", locale);
		}

		await company.update(body);
		return res.status(200).json({
			message: await translation("COMPANY.UPDATED_SUCCESSFULLY", locale),
			company: await buildCompanyResponse(company),
		});
	} catch (error) {
		if (await handleZodError(error, locale, res)) return;
		return sendError(res, 500, "COMPANY.UPDATE_FAILED", locale, error);
	}
};

export const deleteCompany = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const company = await Company.findByPk(req.params.id as string);
		if (!company) {
			return sendError(res, 404, "COMPANY.NOT_FOUND", locale);
		}

		if (company.company_image_id) {
			await deleteCompanyImageHttp({ id: company.company_image_id });
		}

		await company.destroy();
		return res.status(200).json({
			message: await translation("COMPANY.DELETED_SUCCESSFULLY", locale),
		});
	} catch (error) {
		return sendError(res, 500, "COMPANY.DELETE_FAILED", locale, error);
	}
};

export const deleteOwnCompany = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	const companyId = req.user?.id;

	try {
		if (!companyId) {
			return sendError(res, 401, "AUTH.TOKEN_INVALID_OR_MISSING", locale);
		}

		const company = await Company.findByPk(companyId);
		if (!company) {
			return sendError(res, 404, "COMPANY.NOT_FOUND", locale);
		}

		const activeFreightsCount = await countActiveCompanyFreights(req);
		if (activeFreightsCount > 0) {
			return sendError(res, 409, "COMPANY.ACTIVE_FREIGHTS_BLOCK_DELETE", locale);
		}

		if (company.company_image_id) {
			await deleteCompanyImageHttp({ id: company.company_image_id });
		}

		await deleteOwnAccountBySubjectHttp({
			subjectId: Number(company.id),
			authorization: req.headers.authorization,
			locale,
		});

		const transaction = await sequelize.transaction();

		try {
			if (company.companyAddress_id) {
				await CompanyAddress.destroy({
					where: { id: company.companyAddress_id },
					transaction,
				});
			}

			await company.destroy({ transaction });
			await transaction.commit();
		} catch (error) {
			await transaction.rollback();
			throw error;
		}

		return res.status(200).json({
			message: await translation("COMPANY.DELETED_SUCCESSFULLY", locale),
		});
	} catch (error) {
		logError(logger, 'deleteOwnCompany failed', error);
		return sendError(res, 500, "COMPANY.DELETE_FAILED", locale, error);
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

		const company = await Company.create({
			name: body.name,
			email: body.email,
			birthFundation: body.birthFundation,
			phoneNumber: body.phoneNumber,
			website: body.website,
			cnpj: body.cnpj,
			company_image_id: body.company_image_id,
			companyAddress_id: address.id,
		});
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

		const paymentToken = await company.issuePaymentToken();

		return res.status(201).json({
			message: await translation("COMPANY.CREATED_WITH_ACCOUNT_SUCCESSFULLY", locale),
			company,
			address,
			paymentToken,
		});

	} catch (error) {
		if (await handleZodError(error, locale, res)) return;
		return sendError(res, 500, "COMPANY.CREATE_FAILED", locale, error);
	}
};

export const upsertCompanyImage = async (req: RequestWithFile, res: Response) => {
	const locale = getLocaleFromRequest(req);

	try {
		if (!req.file) {
			return sendError(res, 400, "COMPANY_IMAGE.NO_IMAGE_SENT", locale);
		}

		const logoValidation = validateCompanyLogoPng(req.file.buffer);
		if (!logoValidation.valid) {
			if (logoValidation.reason === "INVALID_DIMENSIONS") {
				return sendError(res, 400, "COMPANY_IMAGE.INVALID_DIMENSIONS", locale);
			}

			return sendError(res, 400, "COMPANY_IMAGE.INVALID_FILE", locale);
		}

		const company = await findCompanyWithAddress(req.params.id as string);
		if (!company || !company.id) {
			return sendError(res, 404, "COMPANY.NOT_FOUND", locale);
		}

		let createdImageId: number | null = null;
		let nextImageId = company.company_image_id ?? null;

		try {
			if (
				company.company_image_id &&
				(await companyOwnsImage(company.id, company.company_image_id))
			) {
				const response = await updateCompanyImageHttp({
					imageId: company.company_image_id,
					file: req.file,
				});
				nextImageId = response.userImage.id;
			} else {
				const response = await uploadCompanyImageHttp({
					file: req.file,
					companyId: company.id,
				});
				nextImageId = response.userImage.id;
				createdImageId = response.userImage.id;
			}

			await company.update({ company_image_id: nextImageId });
		} catch (error) {
			if (createdImageId) {
				await deleteCompanyImageHttp({ id: createdImageId });
			}
			throw error;
		}

		return res.status(200).json({
			message: await translation("COMPANY_IMAGE.UPDATED_SUCCESSFULLY", locale),
			company: await buildCompanyResponse(company),
		});
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const status = error.response?.status ?? 500;
			const data = error.response?.data;
			const message =
				typeof data?.message === "string"
					? data.message
					: await translation("COMPANY_IMAGE.UPDATE_FAILED", locale);

			return res.status(status).json({
				code:
					typeof data?.code === "string"
						? data.code
						: "COMPANY_IMAGE.UPDATE_FAILED",
				message,
			});
		}

		logError(logger, 'upsertCompanyImage failed', error);
		return sendError(res, 500, "COMPANY_IMAGE.UPDATE_FAILED", locale, error);
	}
};

export const deleteCompanyImage = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);

	try {
		const company = await findCompanyWithAddress(req.params.id as string);
		if (!company || !company.id) {
			return sendError(res, 404, "COMPANY.NOT_FOUND", locale);
		}

		if (!company.company_image_id) {
			return sendError(res, 404, "COMPANY_IMAGE.NOT_FOUND", locale);
		}

		await deleteCompanyImageHttp({ id: company.company_image_id });
		await company.update({ company_image_id: null });

		return res.status(200).json({
			message: await translation("COMPANY_IMAGE.DELETED_SUCCESSFULLY", locale),
			company: await buildCompanyResponse(company),
		});
	} catch (error) {
		logError(logger, 'deleteCompanyImage failed', error);
		return sendError(res, 500, "COMPANY_IMAGE.DELETE_FAILED", locale, error);
	}
};

export const completeCompanyPayment = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);

	try {
		const company = req.paymentCompany;

		if (!company) {
			return sendError(res, 401, "COMPANY.PAYMENT_TOKEN_INVALID", locale);
		}

		if (company.isPaid) {
			return res.status(200).json({
				message: await translation("COMPANY.PAYMENT_ALREADY_COMPLETED", locale),
			});
		}

		await company.markAsPaid();

		return res.status(200).json({
			message: await translation("COMPANY.PAYMENT_COMPLETED_SUCCESSFULLY", locale),
		});
	} catch (error) {
		logError(logger, "completeCompanyPayment failed", error);
		return sendError(res, 500, "COMPANY.PAYMENT_COMPLETE_FAILED", locale);
	}
};

export const requestCompanyPaymentToken = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);

	try {
		const body = paymentTokenRequestSchema.parse(req.body);
		const normalizedEmail = body.email.trim().toLowerCase();

		const company = await Company.findOne({ where: { email: normalizedEmail } });

		if (!company || company.isPaid) {
			return res.status(200).json({
				message: await translation("COMPANY.PAYMENT_TOKEN_REQUEST_ACCEPTED", locale),
			});
		}

		const paymentToken = await company.issuePaymentToken();

		return res.status(200).json({
			message: await translation("COMPANY.PAYMENT_TOKEN_ISSUED", locale),
			paymentToken,
		});
	} catch (error) {
		if (await handleZodError(error, locale, res)) return;
		logError(logger, "requestCompanyPaymentToken failed", error);
		return sendError(res, 500, "COMPANY.PAYMENT_TOKEN_REQUEST_FAILED", locale);
	}
};

export const getCompanyPaymentStatusBySubject = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);

	try {
		const subjectId = Number(req.params.subjectId);

		if (!Number.isInteger(subjectId) || subjectId <= 0) {
			return sendError(res, 400, "VALIDATION.GENERAL_ERROR", locale);
		}

		const company = await Company.findByPk(subjectId);

		if (!company) {
			return sendError(res, 404, "COMPANY.NOT_FOUND", locale);
		}

		return res.status(200).json({
			isPaid: Boolean(company.isPaid),
		});
	} catch (error) {
		logError(logger, "getCompanyPaymentStatusBySubject failed", error);
		return sendError(res, 500, "COMPANY.GET_PAYMENT_STATUS_FAILED", locale);
	}
};
