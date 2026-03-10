import { Request, Response } from "express";
import GroupVehicleType from "../models/groupVehicleType.model";
import CnhType from "../models/cnh.model";
import { translation } from "../utils/i18n";
import { getLocaleFromRequest } from "../utils/locale";
import { validateBody, validateParams, idParamSchema } from "../utils/validate";
import { createGroupVehicleTypeSchema, updateGroupVehicleTypeSchema } from "../schemas/groupVehicleType.schemas";

export const createGroupVehicleType = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	const body = await validateBody(req, res, createGroupVehicleTypeSchema);
	if (!body) return;

	try {
		const groupVehicleType = await GroupVehicleType.create(body);
		return res.status(201).json({
			message: await translation("GROUP_VEHICLE_TYPE.CREATED_SUCCESSFULLY", locale),
			groupVehicleType,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation("GROUP_VEHICLE_TYPE.CREATE_FAILED", locale),
		});
	}
};

export const getAllGroupVehicleTypes = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);

	try {
		const groupVehicleTypes = await GroupVehicleType.findAll({
			include: [
				{
					model: CnhType,
					attributes: ["id", "name"],
				},
			],
		});
		return res.status(200).json(groupVehicleTypes);
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation("GROUP_VEHICLE_TYPE.GET_ALL_FAILED", locale),
		});
	}
};

export const getGroupVehicleTypeById = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	const params = await validateParams(req, res, idParamSchema);
	if (!params) return;

	try {
		const groupVehicleType = await GroupVehicleType.findByPk(params.id, {
			include: [
				{
					model: CnhType,
					attributes: ["id", "name"],
				},
			],
		});

		if (!groupVehicleType) {
			return res.status(404).json({
				message: await translation("GROUP_VEHICLE_TYPE.NOT_FOUND", locale),
			});
		}

		return res.status(200).json(groupVehicleType);
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation("GROUP_VEHICLE_TYPE.GET_BY_ID_FAILED", locale),
		});
	}
};

export const updateGroupVehicleType = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	const params = await validateParams(req, res, idParamSchema);
	if (!params) return;
	const body = await validateBody(req, res, updateGroupVehicleTypeSchema);
	if (!body) return;

	try {
		const groupVehicleType = await GroupVehicleType.findByPk(params.id);

		if (!groupVehicleType) {
			return res.status(404).json({
				message: await translation("GROUP_VEHICLE_TYPE.NOT_FOUND", locale),
			});
		}

		await groupVehicleType.update(body);
		return res.status(200).json({
			message: await translation("GROUP_VEHICLE_TYPE.UPDATED_SUCCESSFULLY", locale),
			groupVehicleType,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation("GROUP_VEHICLE_TYPE.UPDATE_FAILED", locale),
		});
	}
};

export const deleteGroupVehicleType = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	const params = await validateParams(req, res, idParamSchema);
	if (!params) return;

	try {
		const groupVehicleType = await GroupVehicleType.findByPk(params.id);

		if (!groupVehicleType) {
			return res.status(404).json({
				message: await translation("GROUP_VEHICLE_TYPE.NOT_FOUND", locale),
			});
		}

		await groupVehicleType.destroy();
		return res.status(200).json({
			message: await translation("GROUP_VEHICLE_TYPE.DELETED_SUCCESSFULLY", locale),
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation("GROUP_VEHICLE_TYPE.DELETE_FAILED", locale),
		});
	}
};

