import { Request, Response } from 'express';
import CargoType from '../models/cargoTypes.model';
import { createCargoTypeSchema, updateCargoTypeSchema } from '../schemas/cargoTypes.schemas';
import { translation } from '../utils/i18n';
import { getLocaleFromRequest } from '../utils/locale';
import { idParamSchema, validateBody, validateParams } from '../utils/validate';

export const createCargoType = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);

	const body = await validateBody(req, res, createCargoTypeSchema);
	if (!body) return;

	try {
		const cargoType = await CargoType.create(body);
		return res.status(201).json({
			message: await translation('CARGO_TYPE.CREATED_SUCCESSFULLY', locale),
			cargoType,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation('CARGO_TYPE.CREATE_FAILED', locale),
		});
	}
};

export const getAllCargoTypes = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);

	try {
		const cargoTypes = await CargoType.findAll();
		return res.status(200).json(cargoTypes);
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation('CARGO_TYPE.GET_ALL_FAILED', locale),
		});
	}
};

export const getCargoTypeById = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	const params = await validateParams(req, res, idParamSchema);
	if (!params) return;

	try {
		const cargoType = await CargoType.findByPk(params.id);

		if (!cargoType) {
			return res.status(404).json({
				message: await translation('CARGO_TYPE.NOT_FOUND', locale),
			});
		}

		return res.status(200).json(cargoType);
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation('CARGO_TYPE.GET_BY_ID_FAILED', locale),
		});
	}
};

export const updateCargoType = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);

	const params = await validateParams(req, res, idParamSchema);
	if (!params) return;

	const body = await validateBody(req, res, updateCargoTypeSchema);
	if (!body) return;

	try {
		const cargoType = await CargoType.findByPk(params.id);

		if (!cargoType) {
			return res.status(404).json({
				message: await translation('CARGO_TYPE.NOT_FOUND', locale),
			});
		}

		await cargoType.update(body);
		return res.status(200).json({
			message: await translation('CARGO_TYPE.UPDATED_SUCCESSFULLY', locale),
			cargoType,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation('CARGO_TYPE.UPDATE_FAILED', locale),
		});
	}
};

export const deleteCargoType = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);

	const params = await validateParams(req, res, idParamSchema);
	if (!params) return;

	try {
		const cargoType = await CargoType.findByPk(params.id);

		if (!cargoType) {
			return res.status(404).json({
				message: await translation('CARGO_TYPE.NOT_FOUND', locale),
			});
		}

		await cargoType.destroy();
		return res.status(200).json({
			message: await translation('CARGO_TYPE.DELETED_SUCCESSFULLY', locale),
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation('CARGO_TYPE.DELETE_FAILED', locale),
		});
	}
};
