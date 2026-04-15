import { Request, Response } from 'express';
import CargoType from '../models/cargoTypes.model';
import Freight from '../models/freight.model';
import FreightStatusType from '../models/freightStatusTypes.model';
import { FreightStatusSlug } from '../config/statusTypes.constants';
import { createFreightSchema, updateFreightSchema } from '../schemas/freight.schemas';
import { translation } from '../utils/i18n';
import { getLocaleFromRequest } from '../utils/locale';
import { idParamSchema, validateBody, validateParams } from '../utils/validate';

const getFreightInclude = () => [
	{
		model: CargoType,
		required: false,
	},
	{
		model: FreightStatusType,
		required: false,
	},
];

const ensureAuthenticated = async (req: Request, res: Response, locale: string) => {
	if (!req.user) {
		res.status(401).json({
			message: await translation('AUTH.UNAUTHORIZED', locale),
		});
		return false;
	}

	return true;
};

const ensureFreightAccess = async (
	req: Request,
	res: Response,
	locale: string,
	freight: Freight
) => {
	if (!req.user) {
		res.status(401).json({
			message: await translation('AUTH.UNAUTHORIZED', locale),
		});
		return false;
	}

	if (req.user.role === 'ADMIN') {
		return true;
	}

	if (req.user.role === 'COMPANY' && req.user.id === Number(freight.company_id)) {
		return true;
	}

	res.status(403).json({
		message: await translation('AUTH.FORBIDDEN', locale),
	});
	return false;
};

export const createFreight = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	if (!(await ensureAuthenticated(req, res, locale))) return;

	if (req.user?.role !== 'COMPANY' && req.user?.role !== 'ADMIN') {
		return res.status(403).json({
			message: await translation('AUTH.FORBIDDEN', locale),
		});
	}

	const body = await validateBody(req, res, createFreightSchema);
	if (!body) return;

	try {
		const openStatus = await FreightStatusType.findOne({
			where: { name: FreightStatusSlug.OPEN },
		});

		const freight = await Freight.create({
			...body,
			company_id: req.user.id,
			status_id: body.status_id ?? openStatus?.id,
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
	if (!(await ensureAuthenticated(req, res, locale))) return;

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
	if (!(await ensureAuthenticated(req, res, locale))) return;

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

export const updateFreight = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	if (!(await ensureAuthenticated(req, res, locale))) return;

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

		if (!(await ensureFreightAccess(req, res, locale, freight))) return;

		await freight.update(body);
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
	if (!(await ensureAuthenticated(req, res, locale))) return;

	const params = await validateParams(req, res, idParamSchema);
	if (!params) return;

	try {
		const freight = await Freight.findByPk(params.id);

		if (!freight) {
			return res.status(404).json({
				message: await translation('FREIGHT.NOT_FOUND', locale),
			});
		}

		if (!(await ensureFreightAccess(req, res, locale, freight))) return;

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
