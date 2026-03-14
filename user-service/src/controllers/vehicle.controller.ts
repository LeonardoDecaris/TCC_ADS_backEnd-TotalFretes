import { Request, Response } from "express";
import sequelize from "../config/database";
import User from "../models/user.model";
import Vehicle from "../models/vehicle.model";
import VehicleType from "../models/vehicleType.model";
import { translation } from "../utils/i18n";
import { getLocaleFromRequest } from "../utils/locale";
import { validateBody, validateParams, idParamSchema } from "../utils/validate";
import { createVehicleSchema, updateVehicleSchema } from "../schemas/vehicle.schemas";

export const createVehicle = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	const body = await validateBody(req, res, createVehicleSchema);
	if (!body) return;

	try {
		const vehicle = await Vehicle.create({
			...body,
			chassisNumber: body.chassisNumber ?? "",
		});
		return res.status(201).json({
			message: await translation("VEHICLE.CREATED_SUCCESSFULLY", locale),
			vehicle,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation("VEHICLE.CREATE_FAILED", locale),
		});
	}
};

export const createVehicleAndAttachToUser = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	const transaction = await sequelize.transaction();
	try {
		const vehicle = await Vehicle.create({ 
			plateNumber: req.body.plateNumber,
			chassisNumber: req.body.chassisNumber ?? "",
			model: req.body.model,
			mark: req.body.mark,
			city: req.body.city,
			stateUF: req.body.stateUF,
			country: req.body.country,
			vehicleType_id: req.body.vehicleType_id,
		}, { transaction });

		const user = await User.findByPk(req.user?.id, { transaction });

		if (!user) {
			await transaction.rollback();
			return res.status(404).json({ message: "Usuário não encontrado", });
		}

		await user.update({ vehicle_id: vehicle.id }, { transaction });
		await transaction.commit();

		return res.status(201).json({
			message: await translation("VEHICLE.CREATED_SUCCESSFULLY", locale),
		});
	} catch (error) {
		await transaction.rollback();
		console.error(error);
		return res.status(500).json({
			message: await translation("VEHICLE.CREATE_FAILED", locale),
		});
	}
};

export const getAllVehicles = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);

	try {
		const vehicles = await Vehicle.findAll({
			include: [
				{
					model: VehicleType,
					attributes: ["id", "nome"],
				},
			],
		});
		return res.status(200).json(vehicles);
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation("VEHICLE.GET_ALL_FAILED", locale),
		});
	}
};

export const getVehicleById = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	const params = await validateParams(req, res, idParamSchema);
	if (!params) return;

	try {
		const vehicle = await Vehicle.findByPk(params.id, {
			include: [
				{
					model: VehicleType,
					attributes: ["id", "nome", "axes", "weight", "capacityWeight", "length"],
				},
			],
		});

		if (!vehicle) {
			return res.status(404).json({
				message: await translation("VEHICLE.NOT_FOUND", locale),
			});
		}

		return res.status(200).json(vehicle);
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation("VEHICLE.GET_BY_ID_FAILED", locale),
		});
	}
};

export const updateVehicle = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	const params = await validateParams(req, res, idParamSchema);
	if (!params) return;
	const body = await validateBody(req, res, updateVehicleSchema);
	if (!body) return;

	try {
		const vehicle = await Vehicle.findByPk(params.id);

		if (!vehicle) {
			return res.status(404).json({
				message: await translation("VEHICLE.NOT_FOUND", locale),
			});
		}

		await vehicle.update(body);
		return res.status(200).json({
			message: await translation("VEHICLE.UPDATED_SUCCESSFULLY", locale),
			vehicle,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation("VEHICLE.UPDATE_FAILED", locale),
		});
	}
};

export const deleteVehicle = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	const params = await validateParams(req, res, idParamSchema);
	if (!params) return;

	try {
		const vehicle = await Vehicle.findByPk(params.id);

		if (!vehicle) {
			return res.status(404).json({
				message: await translation("VEHICLE.NOT_FOUND", locale),
			});
		}

		await vehicle.destroy();
		return res.status(200).json({
			message: await translation("VEHICLE.DELETED_SUCCESSFULLY", locale),
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation("VEHICLE.DELETE_FAILED", locale),
		});
	}
};

