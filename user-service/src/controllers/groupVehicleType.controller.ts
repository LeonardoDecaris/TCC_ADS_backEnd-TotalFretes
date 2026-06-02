import { Request, Response } from "express";
import GroupVehicleType from "../models/groupVehicleType.model";
import CnhType from "../models/cnh.model";
import { translation } from "../utils/i18n";
import { getLocaleFromRequest } from "../utils/locale";
import { createGroupVehicleTypeSchema, updateGroupVehicleTypeSchema } from "../schemas/groupVehicleType.schemas";
import { handleZodError } from "../utils/zodError";
import { sendError } from "../services/httpResponse";

export const createGroupVehicleType = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const body = createGroupVehicleTypeSchema.parse(req.body);

		const groupVehicleType = await GroupVehicleType.create(body)
		return res.status(201).json({
			message: await translation("GROUP_VEHICLE_TYPE.CREATED_SUCCESSFULLY", locale),
			groupVehicleType,
		});
	} catch (error) {
		const zodError = await handleZodError(error, locale, res);
		if (zodError) return;
		return sendError(res, 500, 'GROUP_VEHICLE_TYPE.CREATE_FAILED', locale, error);
	}
};

export const getAllGroupVehicleTypes = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const groupVehicleTypes = await GroupVehicleType.findAll({
			include: [{ model: CnhType, attributes: ["id", "name"] }],
		});
		return res.status(200).json(groupVehicleTypes);
	} catch (error) {
		return sendError(res, 500, 'GROUP_VEHICLE_TYPE.GET_ALL_FAILED', locale, error);
	}
};

export const getGroupVehicleTypeById = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const groupVehicleType = await GroupVehicleType.findByPk(req.params.id as string, {
			include: [{ model: CnhType, attributes: ["id", "name"] }],
		});

		if (!groupVehicleType) {
			return sendError(res, 404, 'GROUP_VEHICLE_TYPE.NOT_FOUND', locale);
		}

		return res.status(200).json(groupVehicleType);
	} catch (error) {
		return sendError(res, 500, 'GROUP_VEHICLE_TYPE.GET_BY_ID_FAILED', locale, error);
	}
};

export const updateGroupVehicleType = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const body = updateGroupVehicleTypeSchema.parse(req.body);

		const groupVehicleType = await GroupVehicleType.findByPk(req.params.id as string);

		if (!groupVehicleType) {
			return sendError(res, 404, 'GROUP_VEHICLE_TYPE.NOT_FOUND', locale);
		}

		await groupVehicleType.update(body);
		return res.status(200).json({
			message: await translation("GROUP_VEHICLE_TYPE.UPDATED_SUCCESSFULLY", locale),
			groupVehicleType,
		});
	} catch (error) {
		const zodError = await handleZodError(error, locale, res);
		if (zodError) return;
		return sendError(res, 500, 'GROUP_VEHICLE_TYPE.UPDATE_FAILED', locale, error);
	}
};

export const deleteGroupVehicleType = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const groupVehicleType = await GroupVehicleType.findByPk(req.params.id as string);

		if (!groupVehicleType) {
			return sendError(res, 404, 'GROUP_VEHICLE_TYPE.NOT_FOUND', locale);
		}

		await groupVehicleType.destroy();
		return res.status(200).json({
			message: await translation("GROUP_VEHICLE_TYPE.DELETED_SUCCESSFULLY", locale),
		});
	} catch (error) {
		return sendError(res, 500, 'GROUP_VEHICLE_TYPE.DELETE_FAILED', locale, error);
	}
};