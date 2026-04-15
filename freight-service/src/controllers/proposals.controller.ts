import { Op } from 'sequelize';
import { Request, Response } from 'express';
import sequelize from '../config/database';
import Freight from '../models/freight.model';
import Proposal from '../models/proposals.model';
import ProposalStatusType from '../models/proposalsStatusTypes.model';
import { acceptProposalSchema, createProposalSchema, updateProposalSchema } from '../schemas/proposals.schemas';
import { translation } from '../utils/i18n';
import { getLocaleFromRequest } from '../utils/locale';
import { idParamSchema, validateBody, validateParams } from '../utils/validate';
import {
	ACCEPTED_PROPOSAL_STATUS_NAMES,
	ProposalStatusSlug,
} from '../config/statusTypes.constants';

const getProposalInclude = () => [
	{
		model: Freight,
		required: false,
	},
	{
		model: ProposalStatusType,
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

const ensureProposalOwnerOrAdmin = async (
	req: Request,
	res: Response,
	locale: string,
	proposal: Proposal
) => {
	if (!req.user) {
		res.status(401).json({
			message: await translation('AUTH.UNAUTHORIZED', locale),
		});
		return false;
	}

	if (req.user.role === 'ADMIN' || req.user.id === Number(proposal.driver_id)) {
		return true;
	}

	res.status(403).json({
		message: await translation('AUTH.FORBIDDEN', locale),
	});
	return false;
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

export const createProposal = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	if (!(await ensureAuthenticated(req, res, locale))) return;

	if (req.user?.role !== 'USER' && req.user?.role !== 'ADMIN') {
		return res.status(403).json({
			message: await translation('AUTH.FORBIDDEN', locale),
		});
	}

	const body = await validateBody(req, res, createProposalSchema);
	if (!body) return;

	try {
		const freight = await Freight.findByPk(body.freight_id);

		if (!freight) {
			return res.status(404).json({
				message: await translation('FREIGHT.NOT_FOUND', locale),
			});
		}

		const pendingStatus = await ProposalStatusType.findOne({
			where: { name: ProposalStatusSlug.PENDING },
		});

		const proposal = await Proposal.create({
			...body,
			driver_id: req.user.id,
			status_id: pendingStatus?.id,
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
	if (!(await ensureAuthenticated(req, res, locale))) return;

	try {
		const where =
			req.user?.role === 'ADMIN'
				? undefined
				: req.user?.role === 'USER'
					? { driver_id: req.user.id }
					: undefined;

		const proposals = await Proposal.findAll({
			where,
			include: getProposalInclude(),
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
	if (!(await ensureAuthenticated(req, res, locale))) return;

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
	if (!(await ensureAuthenticated(req, res, locale))) return;

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

		if (!(await ensureProposalOwnerOrAdmin(req, res, locale, proposal))) return;

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
	if (!(await ensureAuthenticated(req, res, locale))) return;

	const params = await validateParams(req, res, idParamSchema);
	if (!params) return;

	try {
		const proposal = await Proposal.findByPk(params.id);

		if (!proposal) {
			return res.status(404).json({
				message: await translation('PROPOSAL.NOT_FOUND', locale),
			});
		}

		if (!(await ensureProposalOwnerOrAdmin(req, res, locale, proposal))) return;

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
	if (!(await ensureAuthenticated(req, res, locale))) return;

	if (req.user?.role !== 'COMPANY' && req.user?.role !== 'ADMIN') {
		return res.status(403).json({
			message: await translation('AUTH.FORBIDDEN', locale),
		});
	}

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

		if (
			req.user?.role !== 'ADMIN' &&
			req.user?.id !== Number(freight.company_id)
		) {
			await transaction.rollback();
			return res.status(403).json({
				message: await translation('AUTH.FORBIDDEN', locale),
			});
		}

		const acceptedStatus = await getAcceptedProposalStatus();

		if (!acceptedStatus) {
			await transaction.rollback();
			return res.status(400).json({
				message: await translation('PROPOSAL_STATUS_TYPE.ACCEPTED_NOT_FOUND', locale),
			});
		}

		await proposal.update(
			{
				status_id: acceptedStatus.id,
			},
			{ transaction }
		);

		await freight.update(
			{
				assignedDriver_id: proposal.driver_id,
				finalValue: proposal.value,
			},
			{ transaction }
		);

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
