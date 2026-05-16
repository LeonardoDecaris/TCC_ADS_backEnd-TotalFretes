import { Request, Response } from 'express';
import type { Order } from 'sequelize';
import CargoType from '../models/cargoTypes.model';
import Freight from '../models/freight.model';
import FreightStatusHistory from '../models/freightStatusHistory.model';
import FreightStatusType from '../models/freightStatusTypes.model';
import { FreightStatusSlug } from '../config/statusTypes.constants';
import { createFreightSchema, freightListPaginatedQuerySchema, updateFreightSchema } from '../schemas/freight.schemas';
import { recordFreightStatusHistory } from '../services/freightStatusHistory.service';
import { translation } from '../utils/i18n';
import { getLocaleFromRequest } from '../utils/locale';
import { idParamSchema, validateBody, validateParams, validateQuery } from '../utils/validate';

const getFreightListInclude = () => [
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

const getFreightDetailInclude = () => [
	...getFreightListInclude(),
	{
		model: FreightStatusHistory,
		as: 'FreightStatusHistories',
		required: false,
		separate: true,
		order: [['occurred_at', 'ASC']] as Order,
		include: [
			{
				model: FreightStatusType,
				required: false,
			},
		],
	},
];

export const createFreight = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);

	const body = await validateBody(req, res, createFreightSchema);
	if (!body) return;

	try {
		const defaultStatus = await FreightStatusType.findOne({
			where: { name: FreightStatusSlug.DISPONIVEL },
		});

		const statusId = body.status_id ?? defaultStatus?.id;

		const freight = await Freight.create({
			...body,
			company_id: req.user!.id,
			status_id: statusId,
		});

		if (freight.id != null && statusId != null) {
			await recordFreightStatusHistory(freight.id, statusId, null);
		}

		const created =
			freight.id != null
				? await Freight.findByPk(freight.id, {
						include: getFreightDetailInclude(),
					})
				: null;

		return res.status(201).json({
			message: await translation('FREIGHT.CREATED_SUCCESSFULLY', locale),
			freight: created ?? freight,
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

	const where =
		req.user?.role === 'ADMIN'
			? undefined
			: req.user?.role === 'COMPANY'
				? { company_id: req.user.id }
				: undefined;

	const listInclude = getFreightListInclude();
	const listOrder: Order = [
		['createdAt', 'DESC'],
		['id', 'DESC'],
	];

	const pageRaw = req.query.page;
	const usePagination =
		pageRaw !== undefined && pageRaw !== '' && !(Array.isArray(pageRaw) && pageRaw.length === 0);

	try {
		if (usePagination) {
			const query = await validateQuery(req, res, freightListPaginatedQuerySchema);
			if (!query) return;

			const { rows, count } = await Freight.findAndCountAll({
				where,
				include: listInclude,
				limit: query.limit,
				offset: (query.page - 1) * query.limit,
				order: listOrder,
			});

			const total = typeof count === 'number' ? count : (count as { length: number }).length;
			const hasMore = query.page * query.limit < total;

			return res.status(200).json({
				items: rows,
				total,
				page: query.page,
				limit: query.limit,
				hasMore,
			});
		}

		const freights = await Freight.findAll({
			where,
			include: listInclude,
			order: listOrder,
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
			include: getFreightDetailInclude(),
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
			include: getFreightListInclude(),
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

		const previousStatusId = freight.status_id ?? null;
		await freight.update(body);

		if (body.status_id !== undefined && freight.id != null) {
			await recordFreightStatusHistory(freight.id, body.status_id, previousStatusId);
		}

		await freight.reload({ include: getFreightDetailInclude() });
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


export const cancelFreight = async (req: Request, res: Response) => {
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

		if (req.user?.role !== 'ADMIN' && req.user?.id !== Number(freight.assignedDriver_id)) {
			return res.status(403).json({
				message: await translation('AUTH.FORBIDDEN', locale),
			});
		}

		const canceladoStatus = await FreightStatusType.findOne({
			where: { name: FreightStatusSlug.CANCELADO },
		});

		const statusId = canceladoStatus?.id ?? 2;
		const previousStatusId = freight.status_id ?? null;

		await freight.update({
			assignedDriver_id: null,
			status_id: statusId,
		});

		if (freight.id != null) {
			await recordFreightStatusHistory(freight.id, statusId, previousStatusId);
		}

		await freight.reload({ include: getFreightDetailInclude() });

		return res.status(200).json({
			message: await translation('FREIGHT.CANCELLED_SUCCESSFULLY', locale),
			freight,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation('FREIGHT.CANCEL_FAILED', locale),
		});
	}
};