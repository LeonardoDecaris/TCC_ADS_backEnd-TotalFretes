import { Request, Response } from 'express';
import ProposalStatusType from '../models/proposalsStatusTypes.model';
import { createProposalStatusTypeSchema, updateProposalStatusTypeSchema } from '../schemas/proposalsStatusTypes.schemas';
import { idParamSchema } from '../schemas/common.schemas';
import { sendError } from '../services/httpResponse';
import { translation } from '../utils/i18n';
import { getLocaleFromRequest } from '../utils/locale';
import { handleZodError } from '../utils/zodError';

export const createProposalStatusType = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const body = createProposalStatusTypeSchema.parse(req.body);
    const proposalStatusType = await ProposalStatusType.create(body);
    return res.status(201).json({
      message: await translation('PROPOSAL_STATUS_TYPE.CREATED_SUCCESSFULLY', locale),
      proposalStatusType,
    });
  } catch (error) {
    if (await handleZodError(error, locale, res)) return;
    return sendError(res, 500, 'PROPOSAL_STATUS_TYPE.CREATE_FAILED', locale);
  }
};

export const getAllProposalStatusTypes = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const proposalStatusTypes = await ProposalStatusType.findAll();
    return res.status(200).json(proposalStatusTypes);
  } catch (error) {
    return sendError(res, 500, 'PROPOSAL_STATUS_TYPE.GET_ALL_FAILED', locale);
  }
};

export const getProposalStatusTypeById = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const params = idParamSchema.parse(req.params);
    const proposalStatusType = await ProposalStatusType.findByPk(params.id);
    if (!proposalStatusType) {
      return sendError(res, 404, 'PROPOSAL_STATUS_TYPE.NOT_FOUND', locale);
    }
    return res.status(200).json(proposalStatusType);
  } catch (error) {
    if (await handleZodError(error, locale, res)) return;
    return sendError(res, 500, 'PROPOSAL_STATUS_TYPE.GET_BY_ID_FAILED', locale);
  }
};

export const updateProposalStatusType = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const params = idParamSchema.parse(req.params);
    const body = updateProposalStatusTypeSchema.parse(req.body);
    const proposalStatusType = await ProposalStatusType.findByPk(params.id);
    if (!proposalStatusType) {
      return sendError(res, 404, 'PROPOSAL_STATUS_TYPE.NOT_FOUND', locale);
    }
    await proposalStatusType.update(body);
    return res.status(200).json({
      message: await translation('PROPOSAL_STATUS_TYPE.UPDATED_SUCCESSFULLY', locale),
      proposalStatusType,
    });
  } catch (error) {
    if (await handleZodError(error, locale, res)) return;
    return sendError(res, 500, 'PROPOSAL_STATUS_TYPE.UPDATE_FAILED', locale);
  }
};

export const deleteProposalStatusType = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const params = idParamSchema.parse(req.params);
    const proposalStatusType = await ProposalStatusType.findByPk(params.id);
    if (!proposalStatusType) {
      return sendError(res, 404, 'PROPOSAL_STATUS_TYPE.NOT_FOUND', locale);
    }
    await proposalStatusType.destroy();
    return res.status(200).json({
      message: await translation('PROPOSAL_STATUS_TYPE.DELETED_SUCCESSFULLY', locale),
    });
  } catch (error) {
    if (await handleZodError(error, locale, res)) return;
    return sendError(res, 500, 'PROPOSAL_STATUS_TYPE.DELETE_FAILED', locale);
  }
};
