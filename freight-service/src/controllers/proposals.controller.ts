import { Op } from 'sequelize';
import type { Transaction } from 'sequelize';
import { Request, Response } from 'express';
import sequelize from '../config/database';
import Freight from '../models/freight.model';
import Proposal from '../models/proposals.model';
import ProposalStatusType from '../models/proposalsStatusTypes.model';
import {
	acceptProposalSchema, createProposalSchema, proposalFreightSummaryQuerySchema, proposalListQuerySchema, rejectProposalSchema, updateProposalSchema
} from '../schemas/proposals.schemas';
import { translation } from '../utils/i18n';
import { getLocaleFromRequest } from '../utils/locale';
import { idParamSchema, validateBody, validateParams, validateQuery } from '../utils/validate';
import CargoType from '../models/cargoTypes.model';
import FreightStatusType from '../models/freightStatusTypes.model';
import { recordFreightStatusHistory } from '../services/freightStatusHistory.service';
import { fetchProposalFreightSummary } from '../services/proposalsFreightSummary.service';
import {
	fetchProposalListSummary,
	mapProposalStatusFilterToDomainNames,
} from '../services/proposalsList.service';
import {
	ACCEPTED_PROPOSAL_STATUS_NAMES,
	FreightStatusSlug,
	ProposalStatusSlug,
} from '../config/statusTypes.constants';

const getFreightNestedInclude = () => [
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
];

const getProposalInclude = (statusNames?: string[], withFreightDetails = false) => [
	{
		model: Freight,
		required: false,
		...(withFreightDetails ? { include: getFreightNestedInclude() } : {}),
	},
	{
		model: ProposalStatusType,
		required: Array.isArray(statusNames) && statusNames.length > 0,
		...(Array.isArray(statusNames) && statusNames.length > 0
			? {
					where: {
						name: {
							[Op.in]: statusNames,
						},
					},
				}
			: {}),
	},
];

const getProposalDetailInclude = () => [
	{
		model: Freight,
		required: false,
		include: [
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
		],
	},
	{
		model: ProposalStatusType,
		required: false,
	},
];

const mapProposalStatusSlugToDomainName = mapProposalStatusFilterToDomainNames;

const normalizeSearchTerm = (raw: string | undefined): string | undefined => {
	const term = raw?.trim();
	return term && term.length > 0 ? term : undefined;
};

const getAcceptedProposalStatus = async () => {
	return ProposalStatusType.findOne({
		where: {
			name: {
				[Op.in]: [...ACCEPTED_PROPOSAL_STATUS_NAMES],
			},
		},
	});
};

const getProposalStatusByName = async (name: string, transaction?: Transaction) => {
	return ProposalStatusType.findOne({
		where: { name },
		transaction,
	});
};

export const getProposalFreightSummary = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);

	const query = await validateQuery(req, res, proposalFreightSummaryQuerySchema);
	if (!query) return;

	try {
		const companyId = req.user?.role === 'COMPANY' ? req.user.id : undefined;
		const result = await fetchProposalFreightSummary({
			...query,
			companyId,
		});

		return res.status(200).json(result);
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation('PROPOSAL.GET_ALL_FAILED', locale),
		});
	}
};

export const createProposal = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);

	const body = await validateBody(req, res, createProposalSchema);
	if (!body) return;

	try {
		const freight = await Freight.findByPk(body.freight_id);

		if (!freight) {
			return res.status(404).json({
				message: await translation('FREIGHT.NOT_FOUND', locale),
			});
		}

		const enviadaStatus = await ProposalStatusType.findOne({
			where: { name: ProposalStatusSlug.ENVIADA },
		});

		const proposal = await Proposal.create({
			...body,
			driver_id: req.user!.id,
			status_id: enviadaStatus?.id,
		});

		return res.status(201).json({
			message: await translation('PROPOSAL.CREATED_SUCCESSFULLY', locale),
			proposal,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation('PROPOSAL.CREATE_FAILED', locale),
		});
	}
};

export const getAllProposals = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);

	try {
		const query = await validateQuery(req, res, proposalListQuerySchema);
		if (!query) return;

		const where: {
			freight_id?: number;
			driver_id?: number;
		} = {};

		if (query.freight_id != null) {
			where.freight_id = query.freight_id;
		}

		if (req.user?.role === 'USER') {
			where.driver_id = req.user.id;
		}

		const statusFromProposalView = mapProposalStatusSlugToDomainName(query.proposal_status);
		const statusFilter = query.status;
		const statusNamesFromLegacy = Array.isArray(statusFilter)
			? statusFilter
			: statusFilter != null
				? [statusFilter]
				: undefined;
		const statusNames = statusFromProposalView ?? statusNamesFromLegacy;
		const usePagination = query.page != null;
		const include = getProposalInclude(statusNames, usePagination);
		const searchTerm = normalizeSearchTerm(query.search);

		if (req.user?.role === 'COMPANY') {
			const freightInclude = include.find((entry) => entry.model === Freight);
			if (freightInclude) {
				freightInclude.required = true;
				(freightInclude as { where?: { company_id: number } }).where = {
					company_id: req.user.id,
				};
			}
		}
		if (searchTerm) {
			const freightInclude = include.find((entry) => entry.model === Freight);
			if (freightInclude) {
				const searchLike = `%${searchTerm}%`;
				(freightInclude as { where?: Record<string, unknown> }).where = {
					...((freightInclude as { where?: Record<string, unknown> }).where ?? {}),
					[Op.or]: [
						{ name: { [Op.like]: searchLike } },
						{ origin_label: { [Op.like]: searchLike } },
						{ destination_label: { [Op.like]: searchLike } },
					],
				};
			}
		}

		if (usePagination) {
			const page = query.page!;
			const limit = query.limit ?? 20;
			const { rows, count } = await Proposal.findAndCountAll({
				where: Object.keys(where).length > 0 ? where : undefined,
				include,
				limit,
				offset: (page - 1) * limit,
				order: [
					['createdAt', 'DESC'],
					['id', 'DESC'],
				],
			});
			const total = typeof count === 'number' ? count : (count as { length: number }).length;
			const hasMore = page * limit < total;

			const summary = await fetchProposalListSummary({
				companyId: req.user?.role === 'COMPANY' ? req.user.id : undefined,
				search: searchTerm,
			});

			return res.status(200).json({
				items: rows,
				total,
				page,
				limit,
				hasMore,
				summary,
			});
		}

		const proposals = await Proposal.findAll({
			where: Object.keys(where).length > 0 ? where : undefined,
			include,
			order: [
				['createdAt', 'DESC'],
				['id', 'DESC'],
			],
		});

		return res.status(200).json(proposals);
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation('PROPOSAL.GET_ALL_FAILED', locale),
		});
	}
};

export const getProposalById = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);

	const params = await validateParams(req, res, idParamSchema);
	if (!params) return;

	try {
		const proposal = await Proposal.findByPk(params.id, {
			include: getProposalDetailInclude(),
		});

		if (!proposal) {
			return res.status(404).json({
				message: await translation('PROPOSAL.NOT_FOUND', locale),
			});
		}

		if (req.user?.role === 'USER' && req.user.id !== Number(proposal.driver_id)) {
			return res.status(403).json({
				message: await translation('AUTH.FORBIDDEN', locale),
			});
		}
		if (req.user?.role === 'COMPANY') {
			const freight = (proposal as Proposal & { Freight?: Freight | null }).Freight;
			if (!freight || req.user.id !== Number(freight.company_id)) {
				return res.status(403).json({
					message: await translation('AUTH.FORBIDDEN', locale),
				});
			}
		}

		return res.status(200).json(proposal);
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation('PROPOSAL.GET_BY_ID_FAILED', locale),
		});
	}
};

export const updateProposal = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);

	const params = await validateParams(req, res, idParamSchema);
	if (!params) return;

	const body = await validateBody(req, res, updateProposalSchema);
	if (!body) return;

	try {
		const proposal = await Proposal.findByPk(params.id);

		if (!proposal) {
			return res.status(404).json({
				message: await translation('PROPOSAL.NOT_FOUND', locale),
			});
		}

		if (req.user?.role !== 'ADMIN' && req.user?.id !== Number(proposal.driver_id)) {
			return res.status(403).json({
				message: await translation('AUTH.FORBIDDEN', locale),
			});
		}

		await proposal.update(body);
		return res.status(200).json({
			message: await translation('PROPOSAL.UPDATED_SUCCESSFULLY', locale),
			proposal,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation('PROPOSAL.UPDATE_FAILED', locale),
		});
	}
};

export const deleteProposal = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);

	const params = await validateParams(req, res, idParamSchema);
	if (!params) return;

	try {
		const proposal = await Proposal.findByPk(params.id);

		if (!proposal) {
			return res.status(404).json({
				message: await translation('PROPOSAL.NOT_FOUND', locale),
			});
		}

		if (req.user?.role !== 'ADMIN' && req.user?.id !== Number(proposal.driver_id)) {
			return res.status(403).json({
				message: await translation('AUTH.FORBIDDEN', locale),
			});
		}

		await proposal.destroy();
		return res.status(200).json({
			message: await translation('PROPOSAL.DELETED_SUCCESSFULLY', locale),
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation('PROPOSAL.DELETE_FAILED', locale),
		});
	}
};

export const acceptProposal = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);

	const params = await validateParams(req, res, idParamSchema);
	if (!params) return;

	const body = await validateBody(req, res, acceptProposalSchema);
	if (!body) return;

	const transaction = await sequelize.transaction();

	try {
		const proposal = await Proposal.findByPk(params.id, {
			transaction,
		});

		if (!proposal) {
			await transaction.rollback();
			return res.status(404).json({
				message: await translation('PROPOSAL.NOT_FOUND', locale),
			});
		}

		const freight = await Freight.findByPk(proposal.freight_id, {
			transaction,
		});

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

		const [acceptedStatus, rejectedStatus, notSelectedStatus] = await Promise.all([
			getAcceptedProposalStatus(),
			getProposalStatusByName(ProposalStatusSlug.RECUSADA, transaction),
			getProposalStatusByName(ProposalStatusSlug.NAO_SELECIONADA, transaction),
		]);

		if (!acceptedStatus) {
			await transaction.rollback();
			return res.status(400).json({
				message: await translation('PROPOSAL_STATUS_TYPE.ACCEPTED_NOT_FOUND', locale),
			});
		}

		const blockedStatuses = [rejectedStatus?.id, notSelectedStatus?.id].filter(
			(statusId): statusId is number => statusId != null
		);

		if (proposal.status_id != null && blockedStatuses.includes(Number(proposal.status_id))) {
			await transaction.rollback();
			return res.status(400).json({
				message: await translation('PROPOSAL.ACCEPT_FAILED', locale),
			});
		}

		if (!notSelectedStatus) {
			await transaction.rollback();
			return res.status(400).json({
				message: await translation('PROPOSAL.UPDATE_FAILED', locale),
			});
		}

		const vinculadoStatus = await FreightStatusType.findOne({
			where: { name: FreightStatusSlug.VINCULADO },
			transaction,
		});

		const previousFreightStatusId = freight.status_id ?? null;

		await proposal.update(
			{
				status_id: acceptedStatus.id,
			},
			{ transaction }
		);

		await Proposal.update(
			{
				status_id: notSelectedStatus.id,
			},
			{
				where: {
					freight_id: proposal.freight_id,
					id: {
						[Op.ne]: proposal.id,
					},
				},
				transaction,
			}
		);

		await freight.update(
			{
				assignedDriver_id: proposal.driver_id,
				finalValue: proposal.value,
				...(vinculadoStatus?.id != null ? { status_id: vinculadoStatus.id } : {}),
			},
			{ transaction }
		);

		if (vinculadoStatus?.id != null && freight.id != null) {
			await recordFreightStatusHistory(freight.id, vinculadoStatus.id, previousFreightStatusId, {
				transaction,
			});
		}

		await transaction.commit();

		return res.status(200).json({
			message: await translation('PROPOSAL.ACCEPTED_SUCCESSFULLY', locale),
			proposal,
		});
	} catch (error) {
		await transaction.rollback();
		console.error(error);
		return res.status(500).json({
			message: await translation('PROPOSAL.ACCEPT_FAILED', locale),
		});
	}
};

export const rejectProposal = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);

	const params = await validateParams(req, res, idParamSchema);
	if (!params) return;

	const body = await validateBody(req, res, rejectProposalSchema);
	if (!body) return;

	try {
		const proposal = await Proposal.findByPk(params.id);

		if (!proposal) {
			return res.status(404).json({
				message: await translation('PROPOSAL.NOT_FOUND', locale),
			});
		}

		const freight = await Freight.findByPk(proposal.freight_id);

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

		const rejectedStatus = await ProposalStatusType.findOne({
			where: { name: ProposalStatusSlug.RECUSADA },
		});

		if (!rejectedStatus) {
			return res.status(400).json({
				message: await translation('PROPOSAL.UPDATE_FAILED', locale),
			});
		}

		await proposal.update({
			status_id: rejectedStatus.id,
		});

		return res.status(200).json({
			message: await translation('PROPOSAL.UPDATED_SUCCESSFULLY', locale),
			proposal,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation('PROPOSAL.UPDATE_FAILED', locale),
		});
	}
};
