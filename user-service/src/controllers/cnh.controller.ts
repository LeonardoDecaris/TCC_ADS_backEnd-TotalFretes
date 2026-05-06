import { Request, Response } from "express";
import CnhType from "../models/cnh.model";
import { translation } from "../utils/i18n";
import { getLocaleFromRequest } from "../utils/locale";
import { createCnhTypeSchema, updateCnhTypeSchema } from "../schemas/cnh.schemas";
import { handleZodError } from "../utils/zodError";
import { sendError } from "../utils/httpResponse";

export const createCnhType = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const body = createCnhTypeSchema.parse(req.body);

		await CnhType.create(body);
		return res.status(201).json({
			message: await translation("CNH_TYPE.CREATED_SUCCESSFULLY", locale),
		});
	} catch (error) {
		const zodError = await handleZodError(error, locale);
		if (zodError) return res.status(zodError.status).json(zodError.body);
		console.error(error);
		return sendError(res, 500, await translation("CNH_TYPE.CREATE_FAILED", locale));
	}
};

export const getAllCnhTypes = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const cnhTypes = await CnhType.findAll();
		return res.status(200).json(cnhTypes);
	} catch (error) {
		console.error(error);
		return sendError(res, 500, await translation("CNH_TYPE.GET_ALL_FAILED", locale));
	}
};

export const getCnhTypeById = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const cnhType = await CnhType.findByPk(req.params.id as string);
		if (!cnhType) {
			return sendError(res, 404, await translation("CNH_TYPE.NOT_FOUND", locale));
		}
		return res.status(200).json(cnhType);
	} catch (error) {
		console.error(error);
		return sendError(res, 500, await translation("CNH_TYPE.GET_BY_ID_FAILED", locale));
	}
};

export const updateCnhType = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const body = updateCnhTypeSchema.parse(req.body);

		const cnhType = await CnhType.findByPk(req.params.id as string);
		if (!cnhType) {
			return sendError(res, 404, await translation("CNH_TYPE.NOT_FOUND", locale));
		}
		await cnhType.update(body);
		return res.status(200).json({
			message: await translation("CNH_TYPE.UPDATED_SUCCESSFULLY", locale),
		});
	} catch (error) {
		const zodError = await handleZodError(error, locale);
		if (zodError) return res.status(zodError.status).json(zodError.body);
		console.error(error);
		return sendError(res, 500, await translation("CNH_TYPE.UPDATE_FAILED", locale));
	}
};

export const deleteCnhType = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const cnhType = await CnhType.findByPk(req.params.id as string);
		if (!cnhType) {
			return sendError(res, 404, await translation("CNH_TYPE.NOT_FOUND", locale));
		}
		await cnhType.destroy();
		return res.status(200).json({
			message: await translation("CNH_TYPE.DELETED_SUCCESSFULLY", locale),
		});
	} catch (error) {
		console.error(error);
		return sendError(res, 500, await translation("CNH_TYPE.DELETE_FAILED", locale));
	}
};
