import { Request, Response } from 'express';
import type { Order } from 'sequelize';
import sequelize from '../config/database';
import CargoType from '../models/cargoTypes.model';
import Freight from '../models/freight.model';
import FreightStatusHistory from '../models/freightStatusHistory.model';
import FreightStatusType from '../models/freightStatusTypes.model';
import Proposal from '../models/proposals.model';
import { FreightStatusSlug } from '../config/statusTypes.constants';
import { createFreightSchema, updateFreightSchema } from '../schemas/freight.schemas';
import { recordFreightStatusHistory } from '../services/freightStatusHistory.service';
import { translation } from '../utils/i18n';
import { getLocaleFromRequest } from '../utils/locale';
import { idParamSchema, validateBody, validateParams } from '../utils/validate';

const getFreightListInclude = () => [
	{
		model: CargoType,
		required: false,
	},
	{
		model: FreightStatusType,
		required: false,
	},
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

	try {
		const where =
			req.user?.role === 'ADMIN'
				? undefined
				: req.user?.role === 'COMPANY'
					? { company_id: req.user.id }
					: undefined;

		const freights = await Freight.findAll({
			where,
			include: getFreightListInclude(),
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

	const transaction = await sequelize.transaction();

	try {
		const freight = await Freight.findByPk(params.id);

		if (!freight) {
			await transaction.rollback();
			return res.status(404).json({
				message: await translation('FREIGHT.NOT_FOUND', locale),
			});
		}

		if (req.user?.role !== 'ADMIN' && req.user?.id !== Number(freight.company_id)) {
			await transaction.rollback();
			return res.status(403).json({
				message: await translation('AUTH.FORBIDDEN', locale),
			});
		}

		await Proposal.destroy({
			where: { freight_id: freight.id },
			transaction,
		});

		await FreightStatusHistory.destroy({
			where: { freight_id: freight.id },
			transaction,
		});

		await freight.destroy({ transaction });
		await transaction.commit();
		return res.status(200).json({
			message: await translation('FREIGHT.DELETED_SUCCESSFULLY', locale),
		});
	} catch (error) {
		await transaction.rollback();
		console.error(error);
		return res.status(500).json({
			message: await translation('FREIGHT.DELETE_FAILED', locale),
		});
	}
};
