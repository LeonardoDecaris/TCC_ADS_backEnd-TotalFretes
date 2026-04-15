import { Request, Response } from 'express';
import ProposalStatusType from '../models/proposalsStatusTypes.model';
import { createProposalStatusTypeSchema, updateProposalStatusTypeSchema } from '../schemas/proposalsStatusTypes.schemas';
import { translation } from '../utils/i18n';
import { getLocaleFromRequest } from '../utils/locale';
import { idParamSchema, validateBody, validateParams } from '../utils/validate';

const ensureAdmin = async (req: Request, res: Response, locale: string) => {
	if (!req.user) {
		res.status(401).json({
			message: await translation('AUTH.UNAUTHORIZED', locale),
		});
		return false;
	}

	if (req.user.role !== 'ADMIN') {
		res.status(403).json({
			message: await translation('AUTH.FORBIDDEN', locale),
		});
		return false;
	}

	return true;
};

export const createProposalStatusType = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	if (!(await ensureAdmin(req, res, locale))) return;

	const body = await validateBody(req, res, createProposalStatusTypeSchema);
	if (!body) return;

	try {
		const proposalStatusType = await ProposalStatusType.create(body);
		return res.status(201).json({
			message: await translation('PROPOSAL_STATUS_TYPE.CREATED_SUCCESSFULLY', locale),
			proposalStatusType,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation('PROPOSAL_STATUS_TYPE.CREATE_FAILED', locale),
		});
	}
};

export const getAllProposalStatusTypes = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);

	try {
		const proposalStatusTypes = await ProposalStatusType.findAll();
		return res.status(200).json(proposalStatusTypes);
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation('PROPOSAL_STATUS_TYPE.GET_ALL_FAILED', locale),
		});
	}
};

export const getProposalStatusTypeById = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	const params = await validateParams(req, res, idParamSchema);
	if (!params) return;

	try {
		const proposalStatusType = await ProposalStatusType.findByPk(params.id);

		if (!proposalStatusType) {
			return res.status(404).json({
				message: await translation('PROPOSAL_STATUS_TYPE.NOT_FOUND', locale),
			});
		}

		return res.status(200).json(proposalStatusType);
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation('PROPOSAL_STATUS_TYPE.GET_BY_ID_FAILED', locale),
		});
	}
};

export const updateProposalStatusType = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	if (!(await ensureAdmin(req, res, locale))) return;

	const params = await validateParams(req, res, idParamSchema);
	if (!params) return;

	const body = await validateBody(req, res, updateProposalStatusTypeSchema);
	if (!body) return;

	try {
		const proposalStatusType = await ProposalStatusType.findByPk(params.id);

		if (!proposalStatusType) {
			return res.status(404).json({
				message: await translation('PROPOSAL_STATUS_TYPE.NOT_FOUND', locale),
			});
		}

		await proposalStatusType.update(body);
		return res.status(200).json({
			message: await translation('PROPOSAL_STATUS_TYPE.UPDATED_SUCCESSFULLY', locale),
			proposalStatusType,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation('PROPOSAL_STATUS_TYPE.UPDATE_FAILED', locale),
		});
	}
};

export const deleteProposalStatusType = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	if (!(await ensureAdmin(req, res, locale))) return;

	const params = await validateParams(req, res, idParamSchema);
	if (!params) return;

	try {
		const proposalStatusType = await ProposalStatusType.findByPk(params.id);

		if (!proposalStatusType) {
			return res.status(404).json({
				message: await translation('PROPOSAL_STATUS_TYPE.NOT_FOUND', locale),
			});
		}

		await proposalStatusType.destroy();
		return res.status(200).json({
			message: await translation('PROPOSAL_STATUS_TYPE.DELETED_SUCCESSFULLY', locale),
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation('PROPOSAL_STATUS_TYPE.DELETE_FAILED', locale),
		});
	}
};
