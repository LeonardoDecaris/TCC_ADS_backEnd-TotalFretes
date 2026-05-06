import { Request, Response } from "express";
import VehicleType from "../models/vehicleType.model";
import GroupVehicleType from "../models/groupVehicleType.model";
import { translation } from "../utils/i18n";
import { getLocaleFromRequest } from "../utils/locale";
import { createVehicleTypeSchema, updateVehicleTypeSchema } from "../schemas/vehicleType.schemas";
import { handleZodError } from "../utils/zodError";
import { sendError } from "../utils/httpResponse";

export const createVehicleType = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const body = createVehicleTypeSchema.parse(req.body);
		await VehicleType.create(body);

		return res.status(201).json({
			message: await translation("VEHICLE_TYPE.CREATED_SUCCESSFULLY", locale),
		});
	} catch (error) {
		const zodError = await handleZodError(error, locale);
		if (zodError) {
			return res.status(zodError.status).json(zodError.body);
		}
		
		return sendError(res, 500, await translation("VEHICLE_TYPE.CREATE_FAILED", locale), { error });
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
		return sendError(res, 500, await translation("VEHICLE_TYPE.GET_ALL_FAILED", locale), { error });
	}
};

export const getVehicleTypeById = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const vehicleType = await VehicleType.findByPk(req.params.id as string, {
			include: [
				{
					model: GroupVehicleType,
					attributes: ["id", "nome"],
				},
			],
		});

		if (!vehicleType) {
			return sendError(res, 404, await translation("VEHICLE_TYPE.NOT_FOUND", locale));
		}

		return res.status(200).json(vehicleType);
	} catch (error) {
		return sendError(res, 500, await translation("VEHICLE_TYPE.GET_BY_ID_FAILED", locale), { error });
	}
};

export const updateVehicleType = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {

		const body = updateVehicleTypeSchema.parse(req.body);
		
		const vehicleType = await VehicleType.findByPk(req.params.id as string);
		if (!vehicleType) {
			return sendError(res, 404, await translation("VEHICLE_TYPE.NOT_FOUND", locale));
		}

		await vehicleType.update(body);
		return res.status(200).json({
			message: await translation("VEHICLE_TYPE.UPDATED_SUCCESSFULLY", locale),
		});
	} catch (error) {
		const zodError = await handleZodError(error, locale);
		if (zodError) return res.status(zodError.status).json(zodError.body);

		return sendError(res, 500, await translation("VEHICLE_TYPE.UPDATE_FAILED", locale), { error });
	}
};

export const deleteVehicleType = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const vehicleType = await VehicleType.findByPk(req.params.id as string);

		if (!vehicleType) {
			return sendError(res, 404, await translation("VEHICLE_TYPE.NOT_FOUND", locale));
		}

		await vehicleType.destroy();
		return res.status(200).json({
			message: await translation("VEHICLE_TYPE.DELETED_SUCCESSFULLY", locale),
		});
	} catch (error) {
		return sendError(res, 500, await translation("VEHICLE_TYPE.DELETE_FAILED", locale), { error });
	}
};
