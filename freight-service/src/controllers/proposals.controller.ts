import { Request, Response } from 'express';
import Freight from '../models/freight.model';
import Proposal from '../models/proposals.model';
import { idParamSchema } from '../schemas/common.schemas';
import {
  acceptProposalSchema,
  createProposalSchema,
  proposalFreightSummaryQuerySchema,
  proposalListQuerySchema,
  rejectProposalSchema,
  updateProposalSchema,
} from '../schemas/proposals.schemas';
import {
  enrichProposalWithDriver,
  enrichProposalsWithDriver,
  enrichFreightsCargoImages,
  getEnrichmentContext,
} from '../services/enrichment.service';
import { sendError } from '../services/httpResponse';
import {
  acceptProposalRecord,
  assertCanViewProposal,
  confirmProposalByDriverRecord,
  createProposalRecord,
  declineProposalByDriverRecord,
  deleteProposalRecord,
  fetchProposalFreightSummaryRecord,
  getProposalByIdRecord,
  listProposals,
  ProposalForbiddenError,
  ProposalNotFoundError,
  ProposalValidationError,
  rejectProposalRecord,
  updateProposalRecord,
} from '../services/proposal.service';
import { translation } from '../utils/i18n';
import { getLocaleFromRequest } from '../utils/locale';
import { handleZodError } from '../utils/zodError';

export const getProposalFreightSummary = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const query = proposalFreightSummaryQuerySchema.parse(req.query);
    const companyId = req.user?.role === 'COMPANY' ? req.user.id : undefined;
    const result = await fetchProposalFreightSummaryRecord(query, companyId);
    const enrichedFreights = await enrichFreightsCargoImages(
      result.items.map((item) => item.freight as Record<string, unknown>),
    );
    return res.status(200).json({
      ...result,
      items: result.items.map((item, index) => ({
        ...item,
        freight: enrichedFreights[index] ?? item.freight,
      })),
    });
  } catch (error) {
    if (await handleZodError(error, locale, res)) return;
    return sendError(res, 500, 'PROPOSAL.GET_ALL_FAILED', locale, error);
  }
};

export const createProposal = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const body = createProposalSchema.parse(req.body);
    const proposal = await createProposalRecord(body, req.user!.id);
    return res.status(201).json({
      message: await translation('PROPOSAL.CREATED_SUCCESSFULLY', locale),
      proposal,
    });
  } catch (error) {
    if (error instanceof ProposalNotFoundError) {
      return sendError(res, 404, 'FREIGHT.NOT_FOUND', locale);
    }
    if (await handleZodError(error, locale, res)) return;
    return sendError(res, 500, 'PROPOSAL.CREATE_FAILED', locale, error);
  }
};

export const getAllProposals = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  const ctx = getEnrichmentContext(req);

  try {
    const query = proposalListQuerySchema.parse(req.query);
    const result = await listProposals(query, req.user);

    if (result.paginated) {
      const items = await enrichProposalsWithDriver(result.items, ctx);
      return res.status(200).json({
        items,
        total: result.total,
        page: result.page,
        limit: result.limit,
        hasMore: result.hasMore,
        summary: result.summary,
      });
    }

    const proposals = await enrichProposalsWithDriver(result.items, ctx);
    return res.status(200).json(proposals);
  } catch (error) {
    if (await handleZodError(error, locale, res)) return;
    return sendError(res, 500, 'PROPOSAL.GET_ALL_FAILED', locale, error);
  }
};

export const getProposalById = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const params = idParamSchema.parse(req.params);
    const proposal = await getProposalByIdRecord(params.id);

    if (!proposal) {
      return sendError(res, 404, 'PROPOSAL.NOT_FOUND', locale);
    }

    assertCanViewProposal(proposal as Proposal & { Freight?: Freight | null }, req.user);

    const enriched = await enrichProposalWithDriver(proposal, getEnrichmentContext(req));
    return res.status(200).json(enriched);
  } catch (error) {
    if (error instanceof ProposalForbiddenError) {
      return sendError(res, 403, 'AUTH.FORBIDDEN', locale, error);
    }
    if (await handleZodError(error, locale, res)) return;
    return sendError(res, 500, 'PROPOSAL.GET_BY_ID_FAILED', locale, error);
  }
};

export const updateProposal = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const params = idParamSchema.parse(req.params);
    const body = updateProposalSchema.parse(req.body);
    const proposal = await updateProposalRecord(params.id, body, req.user ?? {});
    return res.status(200).json({
      message: await translation('PROPOSAL.UPDATED_SUCCESSFULLY', locale),
      proposal,
    });
  } catch (error) {
    if (error instanceof ProposalNotFoundError) {
      return sendError(res, 404, 'PROPOSAL.NOT_FOUND', locale, error);
    }
    if (error instanceof ProposalForbiddenError) {
      return sendError(res, 403, 'AUTH.FORBIDDEN', locale, error);
    }
    if (await handleZodError(error, locale, res)) return;
    return sendError(res, 500, 'PROPOSAL.UPDATE_FAILED', locale, error);
  }
};

export const deleteProposal = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const params = idParamSchema.parse(req.params);
    await deleteProposalRecord(params.id, req.user ?? {});
    return res.status(200).json({
      message: await translation('PROPOSAL.DELETED_SUCCESSFULLY', locale),
    });
  } catch (error) {
    if (error instanceof ProposalNotFoundError) {
      return sendError(res, 404, 'PROPOSAL.NOT_FOUND', locale, error);
    }
    if (error instanceof ProposalForbiddenError) {
      return sendError(res, 403, 'AUTH.FORBIDDEN', locale, error);
    }
    if (error instanceof ProposalValidationError) {
      return sendError(res, 400, error.code, locale, error);
    }
    if (await handleZodError(error, locale, res)) return;
    return sendError(res, 500, 'PROPOSAL.DELETE_FAILED', locale, error);
  }
};

export const acceptProposal = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const params = idParamSchema.parse(req.params);
    acceptProposalSchema.parse(req.body);
    const proposal = await acceptProposalRecord(params.id, req.user ?? {});
    return res.status(200).json({
      message: await translation('PROPOSAL.ACCEPTED_SUCCESSFULLY', locale),
      proposal,
    });
  } catch (error) {
    if (error instanceof ProposalNotFoundError) {
      return sendError(res, 404, 'PROPOSAL.NOT_FOUND', locale, error);
    }
    if (error instanceof ProposalForbiddenError) {
      return sendError(res, 403, 'AUTH.FORBIDDEN', locale, error);
    }
    if (error instanceof ProposalValidationError) {
      return sendError(res, 400, error.code, locale, error);
    }
    if (await handleZodError(error, locale, res)) return;
    return sendError(res, 500, 'PROPOSAL.ACCEPT_FAILED', locale, error);
  }
};

export const confirmProposalByDriver = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const params = idParamSchema.parse(req.params);
    acceptProposalSchema.parse(req.body);
    const proposal = await confirmProposalByDriverRecord(params.id, req.user ?? {});
    return res.status(200).json({
      message: await translation('PROPOSAL.CONFIRMED_BY_DRIVER', locale),
      proposal,
    });
  } catch (error) {
    if (error instanceof ProposalNotFoundError) {
      return sendError(res, 404, 'PROPOSAL.NOT_FOUND', locale, error);
    }
    if (error instanceof ProposalForbiddenError) {
      return sendError(res, 403, 'AUTH.FORBIDDEN', locale, error);
    }
    if (error instanceof ProposalValidationError) {
      return sendError(res, 400, error.code, locale, error);
    }
    if (await handleZodError(error, locale, res)) return;
    return sendError(res, 500, 'PROPOSAL.UPDATE_FAILED', locale, error);
  }
};

export const declineProposalByDriver = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const params = idParamSchema.parse(req.params);
    acceptProposalSchema.parse(req.body);
    const proposal = await declineProposalByDriverRecord(params.id, req.user ?? {});
    return res.status(200).json({
      message: await translation('PROPOSAL.DECLINED_BY_DRIVER', locale),
      proposal,
    });
  } catch (error) {
    if (error instanceof ProposalNotFoundError) {
      return sendError(res, 404, 'PROPOSAL.NOT_FOUND', locale, error);
    }
    if (error instanceof ProposalForbiddenError) {
      return sendError(res, 403, 'AUTH.FORBIDDEN', locale, error);
    }
    if (error instanceof ProposalValidationError) {
      return sendError(res, 400, error.code, locale, error);
    }
    if (await handleZodError(error, locale, res)) return;
    return sendError(res, 500, 'PROPOSAL.UPDATE_FAILED', locale, error);
  }
};

export const rejectProposal = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const params = idParamSchema.parse(req.params);
    rejectProposalSchema.parse(req.body);
    const proposal = await rejectProposalRecord(params.id, req.user ?? {});
    return res.status(200).json({
      message: await translation('PROPOSAL.UPDATED_SUCCESSFULLY', locale),
      proposal,
    });
  } catch (error) {
    if (error instanceof ProposalNotFoundError) {
      return sendError(res, 404, 'PROPOSAL.NOT_FOUND', locale, error);
    }
    if (error instanceof ProposalForbiddenError) {
      return sendError(res, 403, 'AUTH.FORBIDDEN', locale, error);
    }
    if (error instanceof ProposalValidationError) {
      return sendError(res, 400, error.code, locale, error);
    }
    if (await handleZodError(error, locale, res)) return;
    return sendError(res, 500, 'PROPOSAL.UPDATE_FAILED', locale, error);
  }
};
