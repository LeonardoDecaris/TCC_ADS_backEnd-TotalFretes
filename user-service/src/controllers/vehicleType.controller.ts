import { Request, Response } from "express";
import VehicleType from "../models/vehicleType.model";
import GroupVehicleType from "../models/groupVehicleType.model";
import { translation } from "../utils/i18n";
import { getLocaleFromRequest } from "../utils/locale";
import { validateBody, validateParams, idParamSchema } from "../utils/validate";
import { createVehicleTypeSchema, updateVehicleTypeSchema } from "../schemas/vehicleType.schemas";

export const createVehicleType = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	const body = await validateBody(req, res, createVehicleTypeSchema);
	if (!body) return;

	try {
		const vehicleType = await VehicleType.create(body);
		return res.status(201).json({
			message: await translation("VEHICLE_TYPE.CREATED_SUCCESSFULLY", locale),
			vehicleType,
		});
	} catch (error) {
		const err = error as Error;
		console.error("[VehicleType.create]", err?.message ?? err);
		return res.status(500).json({
			message: await translation("VEHICLE_TYPE.CREATE_FAILED", locale),
			...(process.env.NODE_ENV !== "production" && err?.message && { detail: err.message }),
		});
	}
};

export const getAllVehicleTypes = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);

	try {
		const vehicleTypes = await VehicleType.findAll({
			include: [
				{
					model: GroupVehicleType,
					attributes: ["id", "nome"],
				},
			],
		});
		return res.status(200).json(vehicleTypes);
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation("VEHICLE_TYPE.GET_ALL_FAILED", locale),
		});
	}
};

export const getVehicleTypeById = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	const params = await validateParams(req, res, idParamSchema);
	if (!params) return;

	try {
		const vehicleType = await VehicleType.findByPk(params.id, {
			include: [
				{
					model: GroupVehicleType,
					attributes: ["id", "nome"],
				},
			],
		});

		if (!vehicleType) {
			return res.status(404).json({
				message: await translation("VEHICLE_TYPE.NOT_FOUND", locale),
			});
		}

		return res.status(200).json(vehicleType);
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation("VEHICLE_TYPE.GET_BY_ID_FAILED", locale),
		});
	}
};

export const updateVehicleType = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	const params = await validateParams(req, res, idParamSchema);
	if (!params) return;
	const body = await validateBody(req, res, updateVehicleTypeSchema);
	if (!body) return;

	try {
		const vehicleType = await VehicleType.findByPk(params.id);

		if (!vehicleType) {
			return res.status(404).json({
				message: await translation("VEHICLE_TYPE.NOT_FOUND", locale),
			});
		}

		await vehicleType.update(body);
		return res.status(200).json({
			message: await translation("VEHICLE_TYPE.UPDATED_SUCCESSFULLY", locale),
			vehicleType,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation("VEHICLE_TYPE.UPDATE_FAILED", locale),
		});
	}
};

export const deleteVehicleType = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	const params = await validateParams(req, res, idParamSchema);
	if (!params) return;

	try {
		const vehicleType = await VehicleType.findByPk(params.id);

		if (!vehicleType) {
			return res.status(404).json({
				message: await translation("VEHICLE_TYPE.NOT_FOUND", locale),
			});
		}

		await vehicleType.destroy();
		return res.status(200).json({
			message: await translation("VEHICLE_TYPE.DELETED_SUCCESSFULLY", locale),
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation("VEHICLE_TYPE.DELETE_FAILED", locale),
		});
	}
};

