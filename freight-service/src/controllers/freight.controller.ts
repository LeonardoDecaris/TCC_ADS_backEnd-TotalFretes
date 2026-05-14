import { Request, Response } from 'express';
import CargoType from '../models/cargoTypes.model';
import Freight from '../models/freight.model';
import FreightStatusType from '../models/freightStatusTypes.model';
import Proposal from '../models/proposals.model';
import { FreightStatusSlug } from '../config/statusTypes.constants';
import { createFreightSchema, updateFreightSchema } from '../schemas/freight.schemas';
import { translation } from '../utils/i18n';
import { getLocaleFromRequest } from '../utils/locale';
import { idParamSchema, validateBody, validateParams } from '../utils/validate';

const getFreightInclude = () => [
	{
		model: CargoType,
		as: 'cargo',
		required: false,
	},
	{
		model: FreightStatusType,
		as: 'status',
		required: false,
	}
];

export const createFreight = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);

	const body = await validateBody(req, res, createFreightSchema);
	if (!body) return;

	try {
		const defaultStatus = await FreightStatusType.findOne({
			where: { name: FreightStatusSlug.DISPONIVEL },
		});

		const freight = await Freight.create({
			...body,
			company_id: req.user!.id,
			status_id: body.status_id ?? defaultStatus?.id,
		});

		return res.status(201).json({
			message: await translation('FREIGHT.CREATED_SUCCESSFULLY', locale),
			freight,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation('FREIGHT.CREATE_FAILED', locale),
		});
	}
};

export const getAllFreights = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);

	try {
		const where =
			req.user?.role === 'ADMIN'
				? undefined
				: req.user?.role === 'COMPANY'
					? { company_id: req.user.id }
					: undefined;

		const freights = await Freight.findAll({
			where,
			include: getFreightInclude(),
		});

		return res.status(200).json(freights);
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation('FREIGHT.GET_ALL_FAILED', locale),
		});
	}
};

export const getFreightById = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);

	const params = await validateParams(req, res, idParamSchema);
	if (!params) return;

	try {
		const freight = await Freight.findByPk(params.id, {
			include: getFreightInclude(),
		});

		if (!freight) {
			return res.status(404).json({
				message: await translation('FREIGHT.NOT_FOUND', locale),
			});
		}

		if (req.user?.role === 'COMPANY' && req.user.id !== Number(freight.company_id)) {
			return res.status(403).json({
				message: await translation('AUTH.FORBIDDEN', locale),
			});
		}

		return res.status(200).json(freight);
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation('FREIGHT.GET_BY_ID_FAILED', locale),
		});
	}
};

export const getFreightByUserId = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);

	try {
		const freight = await Freight.findOne({
			where: { assignedDriver_id: req.params.id },
			include: getFreightInclude(),
		});

		console.log("freight", freight);

		return res.status(200).json(freight);
	} catch (error) {
		console.error(error);
		console.log("erro", error);
		return res.status(500).json({
			message: await translation('FREIGHT.GET_BY_ID_FAILED', locale),
		});
	}
};

export const updateFreight = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);

	const params = await validateParams(req, res, idParamSchema);
	if (!params) return;

	const body = await validateBody(req, res, updateFreightSchema);
	if (!body) return;

	try {
		const freight = await Freight.findByPk(params.id);

		if (!freight) {
			return res.status(404).json({
				message: await translation('FREIGHT.NOT_FOUND', locale),
			});
		}

		if (req.user?.role !== 'ADMIN' && req.user?.id !== Number(freight.company_id)) {
			return res.status(403).json({
				message: await translation('AUTH.FORBIDDEN', locale),
			});
		}

		await freight.update(body);
		await freight.reload({ include: getFreightInclude() });
		return res.status(200).json({
			message: await translation('FREIGHT.UPDATED_SUCCESSFULLY', locale),
			freight,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation('FREIGHT.UPDATE_FAILED', locale),
		});
	}
};

export const deleteFreight = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);

	const params = await validateParams(req, res, idParamSchema);
	if (!params) return;

	try {
		const freight = await Freight.findByPk(params.id);

		if (!freight) {
			return res.status(404).json({
				message: await translation('FREIGHT.NOT_FOUND', locale),
			});
		}

		if (req.user?.role !== 'ADMIN' && req.user?.id !== Number(freight.company_id)) {
			return res.status(403).json({
				message: await translation('AUTH.FORBIDDEN', locale),
			});
		}

		await freight.destroy();
		return res.status(200).json({
			message: await translation('FREIGHT.DELETED_SUCCESSFULLY', locale),
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation('FREIGHT.DELETE_FAILED', locale),
		});
	}
};
