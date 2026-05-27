import { Request, Response } from 'express';
import type { Order, Transaction } from 'sequelize';
import { Op } from 'sequelize';
import type { Order } from 'sequelize';
import sequelize from '../config/database';
import CargoType from '../models/cargoTypes.model';
import Freight from '../models/freight.model';
import FreightStatusHistory from '../models/freightStatusHistory.model';
import FreightStatusType from '../models/freightStatusTypes.model';
import Proposal from '../models/proposals.model';
import ProposalStatusType from '../models/proposalsStatusTypes.model';
import { FreightStatusSlug, ProposalStatusSlug } from '../config/statusTypes.constants';
import { createFreightSchema, freightListPaginatedQuerySchema, updateFreightSchema } from '../schemas/freight.schemas';
import { recordFreightStatusHistory } from '../services/freightStatusHistory.service';
import { translation } from '../utils/i18n';
import { getLocaleFromRequest } from '../utils/locale';
import { idParamSchema, validateBody, validateParams, validateQuery } from '../utils/validate';

const getFreightStatusHistoryInclude = () => ({
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
});

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
	},
	getFreightStatusHistoryInclude(),
];

const getFreightDetailInclude = () => [
	...getFreightListInclude(),
];

const getProposalStatusByName = async (name: string, transaction?: Transaction) => {
	return ProposalStatusType.findOne({
		where: { name },
		transaction,
	});
};

const markFreightProposalsAsNotSelected = async (freightId: number, transaction?: Transaction) => {
	const notSelectedStatus = await getProposalStatusByName(
		ProposalStatusSlug.NAO_SELECIONADA,
		transaction
	);

	if (!notSelectedStatus?.id) {
		throw new Error(`Proposal status not found: ${ProposalStatusSlug.NAO_SELECIONADA}`);
	}

	await Proposal.update(
		{
			status_id: notSelectedStatus.id,
		},
		{
			where: { freight_id: freightId },
			transaction,
		}
	);
};
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

const buildFreightListWhere = async (user?: { role?: string; id?: number }) => {
	if (user?.role === 'ADMIN') return undefined;
	if (user?.role === 'COMPANY') return { company_id: user.id };
	if (user?.role === 'USER') {
		const disponivelStatus = await FreightStatusType.findOne({
			where: { name: FreightStatusSlug.DISPONIVEL },
		});
		if (disponivelStatus?.id != null) {
			return { status_id: disponivelStatus.id };
		}
	}
	return undefined;
};

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

	const where = await buildFreightListWhere(req.user);

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

/**
 * Status que indicam que o frete N\u00c3O est\u00e1 mais em andamento para o motorista
 * - portanto n\u00e3o devem aparecer na tela "Em andamento" do app mobile.
 */
const NON_ONGOING_DRIVER_STATUSES: readonly string[] = [
	FreightStatusSlug.CONCLUIDO,
	FreightStatusSlug.CANCELADO,
];

export const getFreightByUserId = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);

	try {
		const excludedStatuses = await FreightStatusType.findAll({
			where: { name: { [Op.in]: [...NON_ONGOING_DRIVER_STATUSES] } },
			attributes: ['id'],
		});
		const excludedIds = excludedStatuses.map((s) => s.id).filter((id): id is number => id != null);

		const freight = await Freight.findOne({
			where: {
				assignedDriver_id: req.params.id,
				...(excludedIds.length > 0 ? { status_id: { [Op.notIn]: excludedIds } } : {}),
			},
			include: getFreightListInclude(),
			order: [['updatedAt', 'DESC']],
		});

		return res.status(200).json(freight);
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation('FREIGHT.GET_BY_ID_FAILED', locale),
		});
	}
};

/**
 * Transi\u00e7\u00f5es de status permitidas para o motorista (USER).
 * Cada chave \u00e9 o status atual e o valor \u00e9 a lista de pr\u00f3ximos status v\u00e1lidos.
 *
 * `Concluido` n\u00e3o entra aqui porque \u00e9 responsabilidade da empresa via
 * `completeFreight`. `Vinculado` continua suportado para compatibilidade com
 * fretes legados criados antes da introdu\u00e7\u00e3o de `Esperando Caminhoneiro`.
 */
const DRIVER_VALID_TRANSITIONS: Record<string, readonly string[]> = {
	[FreightStatusSlug.VINCULADO]: [FreightStatusSlug.EM_TRANSITO],
	[FreightStatusSlug.EM_TRANSITO]: [FreightStatusSlug.EM_ROTA_ENTREGA],
	[FreightStatusSlug.EM_ROTA_ENTREGA]: [FreightStatusSlug.ENTREGUE],
};

export const updateFreight = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);

	const params = await validateParams(req, res, idParamSchema);
	if (!params) return;

	const body = await validateBody(req, res, updateFreightSchema);
	if (!body) return;

	const transaction = await sequelize.transaction();
	let transactionCommitted = false;

	try {
		const freight = await Freight.findByPk(params.id, { transaction });

		if (!freight) {
			await transaction.rollback();
			return res.status(404).json({
				message: await translation('FREIGHT.NOT_FOUND', locale),
			});
		}

		const role = req.user?.role;
		const isAdmin = role === 'ADMIN';
		const isOwnerCompany = role === 'COMPANY' && req.user?.id === Number(freight.company_id);
		const isAssignedDriver = role === 'USER' && req.user?.id === Number(freight.assignedDriver_id);

		if (!isAdmin && !isOwnerCompany && !isAssignedDriver) {
		if (req.user?.role !== 'ADMIN' && req.user?.id !== Number(freight.company_id)) {
			await transaction.rollback();
			return res.status(403).json({
				message: await translation('AUTH.FORBIDDEN', locale),
			});
		}

		const previousStatusId = freight.status_id ?? null;
		await freight.update(body, { transaction });

		if (isAssignedDriver && !isAdmin) {
			if (body.status_id == null) {
				return res.status(400).json({
					message: await translation('FREIGHT.STATUS_REQUIRED', locale),
				});
			}

			const [currentStatus, targetStatus] = await Promise.all([
				previousStatusId != null ? FreightStatusType.findByPk(previousStatusId) : Promise.resolve(null),
				FreightStatusType.findByPk(body.status_id),
			]);

			const allowedNextNames = currentStatus?.name
				? DRIVER_VALID_TRANSITIONS[currentStatus.name] ?? []
				: [];
			const targetName = targetStatus?.name ?? null;

			if (!targetName || !allowedNextNames.includes(targetName)) {
				return res.status(400).json({
					message: await translation('FREIGHT.INVALID_STATUS_TRANSITION', locale),
				});
			}

			await freight.update({ status_id: body.status_id });

			if (freight.id != null) {
				await recordFreightStatusHistory(freight.id, body.status_id, previousStatusId);
			}
		} else {
			await freight.update(body);

		if (body.status_id !== undefined && freight.id != null) {
			const canceladoStatus = await FreightStatusType.findOne({
				where: { name: FreightStatusSlug.CANCELADO },
				transaction,
			});
			const canceladoStatusId = canceladoStatus?.id ?? 2;

			if (body.status_id === canceladoStatusId) {
				await markFreightProposalsAsNotSelected(freight.id, transaction);
			}

			await recordFreightStatusHistory(freight.id, body.status_id, previousStatusId, {
				transaction,
			});
		}

		await transaction.commit();
		transactionCommitted = true;
		await freight.reload({ include: getFreightDetailInclude() });
		return res.status(200).json({
			message: await translation('FREIGHT.UPDATED_SUCCESSFULLY', locale),
			freight,
		});
	} catch (error) {
		if (!transactionCommitted) {
			await transaction.rollback();
		}
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


export const cancelFreight = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);

	const params = await validateParams(req, res, idParamSchema);
	if (!params) return;

	const transaction = await sequelize.transaction();
	let transactionCommitted = false;

	try {
		const freight = await Freight.findByPk(params.id, { transaction });

		if (!freight) {
			await transaction.rollback();
			return res.status(404).json({
				message: await translation('FREIGHT.NOT_FOUND', locale),
			});
		}

		const canCancelFreight =
			req.user?.role === 'ADMIN' ||
			(req.user?.role === 'COMPANY' && req.user.id === Number(freight.company_id)) ||
			(req.user?.role === 'USER' && req.user.id === Number(freight.assignedDriver_id));

		if (!canCancelFreight) {
			await transaction.rollback();
			return res.status(403).json({
				message: await translation('AUTH.FORBIDDEN', locale),
			});
		}

		const canceladoStatus = await FreightStatusType.findOne({
			where: { name: FreightStatusSlug.CANCELADO },
			transaction,
		});

		const statusId = canceladoStatus?.id ?? 2;
		const previousStatusId = freight.status_id ?? null;

		await freight.update({
			assignedDriver_id: null,
			status_id: statusId,
		}, { transaction });

		if (freight.id != null) {
			await markFreightProposalsAsNotSelected(freight.id, transaction);
			await recordFreightStatusHistory(freight.id, statusId, previousStatusId, {
				transaction,
			});
		}

		await transaction.commit();
		transactionCommitted = true;
		await freight.reload({ include: getFreightDetailInclude() });

		return res.status(200).json({
			message: await translation('FREIGHT.CANCELLED_SUCCESSFULLY', locale),
			freight,
		});
	} catch (error) {
		if (!transactionCommitted) {
			await transaction.rollback();
		}
		console.error(error);
		return res.status(500).json({
			message: await translation('FREIGHT.CANCEL_FAILED', locale),
		});
	}
};

export const completeFreight = async (req: Request, res: Response) => {
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

		const entregueStatus = await FreightStatusType.findOne({
			where: { name: FreightStatusSlug.ENTREGUE },
		});

		if (entregueStatus?.id != null && freight.status_id !== entregueStatus.id) {
			return res.status(400).json({
				message: await translation('FREIGHT.UPDATE_FAILED', locale),
			});
		}

		const concluidoStatus = await FreightStatusType.findOne({
			where: { name: FreightStatusSlug.CONCLUIDO },
		});

		if (!concluidoStatus?.id) {
			return res.status(400).json({
				message: await translation('FREIGHT.UPDATE_FAILED', locale),
			});
		}

		const previousStatusId = freight.status_id ?? null;
		await freight.update({
			status_id: concluidoStatus.id,
		});

		if (freight.id != null) {
			await recordFreightStatusHistory(freight.id, concluidoStatus.id, previousStatusId);
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