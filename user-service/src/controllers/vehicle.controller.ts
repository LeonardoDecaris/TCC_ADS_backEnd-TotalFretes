import { Request, Response } from "express";
import sequelize from "../config/database";
import User from "../models/user.model";
import Vehicle from "../models/vehicle.model";
import VehicleType from "../models/vehicleType.model";
import { translation } from "../utils/i18n";
import { getLocaleFromRequest } from "../utils/locale";
import { createVehicleSchema, updateVehicleSchema } from "../schemas/vehicle.schemas";
import { handleZodError } from "../utils/zodError";
import { sendError } from "../utils/httpResponse";

export const createVehicle = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const body = createVehicleSchema.parse(req.body);

		await Vehicle.create({
			...body,
			chassisNumber: body.chassisNumber ?? "",
		});
		return res.status(201).json({
			message: await translation("VEHICLE.CREATED_SUCCESSFULLY", locale),
		});
	} catch (error) {
		const zodError = await handleZodError(error, locale);
		if (zodError) return res.status(zodError.status).json(zodError.body);

		return sendError(res, 500, await translation("VEHICLE.CREATE_FAILED", locale), { error });
	}
};

export const createVehicleAndAttachToUser = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	const transaction = await sequelize.transaction();
	try {

		const body = createVehicleSchema.parse(req.body);
		const vehicle = await Vehicle.create({
			...body,
			chassisNumber: body.chassisNumber ?? "",
		}, { transaction });

		const user = await User.findByPk(req.user?.id, { transaction });

		if (!user) {
			await transaction.rollback();
			return sendError(res, 404, await translation("USER.NOT_FOUND", locale));
		}

		await user.update({ vehicle_id: vehicle.id }, { transaction });
		await transaction.commit();

		return res.status(201).json({
			message: await translation("VEHICLE.CREATED_SUCCESSFULLY", locale),
		});
	} catch (error) {
		const zodError = await handleZodError(error, locale);
		if (zodError) return res.status(zodError.status).json(zodError.body);
		await transaction.rollback();

		return sendError(res, 500, await translation("VEHICLE.CREATE_FAILED", locale), { error });
	}
};

export const getAllVehicles = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const vehicles = await Vehicle.findAll({
			include: [{ model: VehicleType, attributes: ["id", "nome"] }],
		});
		return res.status(200).json(vehicles);
	} catch (error) {
		return sendError(res, 500, await translation("VEHICLE.GET_ALL_FAILED", locale), { error });
	}
};

export const getVehicleById = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const vehicle = await Vehicle.findByPk(req.params.id as string, {
			include: [{ model: VehicleType, required: false },],
		});

		if (!vehicle) {
			return sendError(res, 404, await translation("VEHICLE.NOT_FOUND", locale));
		}

		return res.status(200).json(vehicle);
	} catch (error) {
		return sendError(res, 500, await translation("VEHICLE.GET_BY_ID_FAILED", locale), { error });
	}
};

export const updateVehicle = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const body = updateVehicleSchema.parse(req.body);

		const vehicle = await Vehicle.findByPk(req.params.id as string);
		if (!vehicle) {
			return sendError(res, 404, await translation("VEHICLE.NOT_FOUND", locale));
		}

		await vehicle.update(body);
		return res.status(200).json({
			message: await translation("VEHICLE.UPDATED_SUCCESSFULLY", locale),
		});
	} catch (error) {
		const zodError = await handleZodError(error, locale);
		if (zodError) return res.status(zodError.status).json(zodError.body);

		return sendError(res, 500, await translation("VEHICLE.UPDATE_FAILED", locale), { error });
	}
};

export const deleteVehicle = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const vehicle = await Vehicle.findByPk(req.params.id as string);

		if (!vehicle) {
			return sendError(res, 404, await translation("VEHICLE.NOT_FOUND", locale));
		}

		await vehicle.destroy();
		return res.status(200).json({
			message: await translation("VEHICLE.DELETED_SUCCESSFULLY", locale),
		});
	} catch (error) {
		return sendError(res, 500, await translation("VEHICLE.DELETE_FAILED", locale), { error });
	}
};