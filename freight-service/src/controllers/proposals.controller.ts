import { Op } from 'sequelize';
import type { Transaction } from 'sequelize';
import { Request, Response } from 'express';
import sequelize from '../config/database';
import Freight from '../models/freight.model';
import Proposal from '../models/proposals.model';
import ProposalStatusType from '../models/proposalsStatusTypes.model';
import {
	acceptProposalSchema,
	createProposalSchema,
	proposalListQuerySchema,
	rejectProposalSchema,
	updateProposalSchema,
} from '../schemas/proposals.schemas';
import { translation } from '../utils/i18n';
import { getLocaleFromRequest } from '../utils/locale';
import { idParamSchema, validateBody, validateParams } from '../utils/validate';
import { recordFreightStatusHistory } from '../services/freightStatusHistory.service';
import {
	ACCEPTED_PROPOSAL_STATUS_NAMES,
	FreightStatusSlug,
	ProposalStatusSlug,
} from '../config/statusTypes.constants';
import FreightStatusType from '../models/freightStatusTypes.model';

const getProposalInclude = (statusNames?: string[]) => [
	{
		model: Freight,
		required: false,
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
		const queryResult = proposalListQuerySchema.safeParse(req.query);
		if (!queryResult.success) {
			return res.status(400).json({
				message: await translation('VALIDATION.PARAMS_INVALID', locale),
			});
		}

		const where: {
			freight_id?: number;
			driver_id?: number;
		} = {};

		if (queryResult.data.freight_id != null) {
			where.freight_id = queryResult.data.freight_id;
		}

		if (req.user?.role === 'USER') {
			where.driver_id = req.user.id;
		}

		const statusFilter = queryResult.data.status;
		const statusNames = Array.isArray(statusFilter)
			? statusFilter
			: statusFilter != null
				? [statusFilter]
				: undefined;
		const include = getProposalInclude(statusNames);

		if (req.user?.role === 'COMPANY') {
			const freightInclude = include.find((entry) => entry.model === Freight);
			if (freightInclude) {
				freightInclude.required = true;
				(freightInclude as { where?: { company_id: number } }).where = {
					company_id: req.user.id,
				};
			}
		}

		const proposals = await Proposal.findAll({
			where: Object.keys(where).length > 0 ? where : undefined,
			include,
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
			include: getProposalInclude(),
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
