import { Request, Response } from 'express';
import { idParamSchema } from '../schemas/common.schemas';
import {
  createFreightSchema,
  freightHistoryPaginatedQuerySchema,
  freightListPaginatedQuerySchema,
  updateFreightSchema,
} from '../schemas/freight.schemas';
import {
  enrichFreightWithCompany,
  enrichFreightsWithCompany,
  getEnrichmentContext,
} from '../services/enrichment.service';
import {
  assertCompanyCanViewFreight,
  cancelFreightRecord,
  completeFreightRecord,
  createFreightRecord,
  deleteFreightRecord,
  FreightForbiddenError,
  FreightNotFoundError,
  FreightValidationError,
  getFreightByIdRecord,
  getFreightByUserIdRecord,
  listFreightHistoryByUserIdRecord,
  listFreights,
  updateFreightRecord,
} from '../services/freight.service';
import { sendError } from '../services/httpResponse';
import { translation } from '../utils/i18n';
import { getLocaleFromRequest } from '../utils/locale';
import { handleZodError } from '../utils/zodError';

export const createFreight = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const body = createFreightSchema.parse(req.body);
    const role = req.user!.role;

    let companyId: number;
    if (role === 'ADMIN') {
      if (!body.company_id) {
        return sendError(res, 400, 'VALIDATION.COMPANY_ID_REQUIRED', locale);
      }
      companyId = body.company_id;
    } else {
      companyId = req.user!.id;
    }

    const { company_id: _ignored, ...freightBody } = body;
    const freight = await createFreightRecord(freightBody, companyId);
    const enriched = await enrichFreightWithCompany(freight, getEnrichmentContext(req));
    return res.status(201).json({
      message: await translation('FREIGHT.CREATED_SUCCESSFULLY', locale),
      freight: enriched,
    });
  } catch (error) {
    if (error instanceof FreightForbiddenError) {
      return sendError(res, 403, 'AUTH.FORBIDDEN', locale, error);
    }
    if (error instanceof FreightValidationError) {
      return sendError(res, 400, error.code, locale, error);
    }
    if (await handleZodError(error, locale, res)) return;
    return sendError(res, 500, 'FREIGHT.CREATE_FAILED', locale, error);
  }
};

export const getAllFreights = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  const ctx = getEnrichmentContext(req);

  const pageRaw = req.query.page;
  const usePagination =
    pageRaw !== undefined && pageRaw !== '' && !(Array.isArray(pageRaw) && pageRaw.length === 0);

  try {
    if (usePagination) {
      const query = freightListPaginatedQuerySchema.parse(req.query);
      const result = await listFreights(req.user, query, true);
      if (!result.paginated) {
        return sendError(res, 500, 'FREIGHT.GET_ALL_FAILED', locale);
      }

      const items = await enrichFreightsWithCompany(result.items, ctx);
      return res.status(200).json({
        items,
        total: result.total,
        page: result.page,
        limit: result.limit,
        hasMore: result.hasMore,
      });
    }

    const result = await listFreights(req.user);
    const freights = await enrichFreightsWithCompany(result.items, ctx);
    return res.status(200).json(freights);
  } catch (error) {
    if (await handleZodError(error, locale, res)) return;
    return sendError(res, 500, 'FREIGHT.GET_ALL_FAILED', locale, error);
  }
};

export const getFreightById = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const params = idParamSchema.parse(req.params);
    const freight = await getFreightByIdRecord(params.id);

    if (!freight) {
      return sendError(res, 404, 'FREIGHT.NOT_FOUND', locale);
    }

    assertCompanyCanViewFreight(freight, req.user);

    const enriched = await enrichFreightWithCompany(freight, getEnrichmentContext(req));
    return res.status(200).json(enriched);
  } catch (error) {
    if (error instanceof FreightForbiddenError) {
      return sendError(res, 403, 'AUTH.FORBIDDEN', locale, error);
    }
    if (await handleZodError(error, locale, res)) return;
    return sendError(res, 500, 'FREIGHT.GET_BY_ID_FAILED', locale, error);
  }
};

export const getFreightByUserId = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const freight = await getFreightByUserIdRecord(userId);
    if (!freight) {
      return res.status(200).json(null);
    }
    const enriched = await enrichFreightWithCompany(freight, getEnrichmentContext(req));
    return res.status(200).json(enriched);
  } catch (error) {
    if (await handleZodError(error, locale, res)) return;
    return sendError(res, 500, 'FREIGHT.GET_BY_ID_FAILED', locale, error);
  }
};

export const getFreightHistoryByUserId = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  const ctx = getEnrichmentContext(req);

  try {
    const userIdRaw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = Number(userIdRaw);

    if (req.user?.role === 'USER' && req.user.id !== userId) {
      return sendError(res, 403, 'AUTH.FORBIDDEN', locale);
    }

    const query = freightHistoryPaginatedQuerySchema.parse(req.query);
    const result = await listFreightHistoryByUserIdRecord(userId, query);

    if (!result.paginated) {
      return sendError(res, 500, 'FREIGHT.GET_ALL_FAILED', locale);
    }

    const items = await enrichFreightsWithCompany(result.items, ctx);
    return res.status(200).json({
      items,
      total: result.total,
      page: result.page,
      limit: result.limit,
      hasMore: result.hasMore,
    });
  } catch (error) {
    if (error instanceof FreightForbiddenError) {
      return sendError(res, 403, 'AUTH.FORBIDDEN', locale, error);
    }
    if (await handleZodError(error, locale, res)) return;
    return sendError(res, 500, 'FREIGHT.GET_ALL_FAILED', locale, error);
  }
};

export const updateFreight = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const params = idParamSchema.parse(req.params);
    const body = updateFreightSchema.parse(req.body);
    const freight = await updateFreightRecord(params.id, body, req.user ?? {});
    const enriched = await enrichFreightWithCompany(freight, getEnrichmentContext(req));
    return res.status(200).json({
      message: await translation('FREIGHT.UPDATED_SUCCESSFULLY', locale),
      freight: enriched,
    });
  } catch (error) {
    if (error instanceof FreightNotFoundError) {
      return sendError(res, 404, 'FREIGHT.NOT_FOUND', locale, error);
    }
    if (error instanceof FreightForbiddenError) {
      return sendError(res, 403, 'AUTH.FORBIDDEN', locale, error);
    }
    if (error instanceof FreightValidationError) {
      return sendError(res, 400, error.code, locale, error);
    }
    if (await handleZodError(error, locale, res)) return;
    return sendError(res, 500, 'FREIGHT.UPDATE_FAILED', locale, error);
  }
};

export const deleteFreight = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const params = idParamSchema.parse(req.params);
    await deleteFreightRecord(params.id, req.user ?? {});
    return res.status(200).json({
      message: await translation('FREIGHT.DELETED_SUCCESSFULLY', locale),
    });
  } catch (error) {
    if (error instanceof FreightNotFoundError) {
      return sendError(res, 404, 'FREIGHT.NOT_FOUND', locale, error);
    }
    if (error instanceof FreightForbiddenError) {
      return sendError(res, 403, 'AUTH.FORBIDDEN', locale, error);
    }
    if (await handleZodError(error, locale, res)) return;
    return sendError(res, 500, 'FREIGHT.DELETE_FAILED', locale, error);
  }
};

export const cancelFreight = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const params = idParamSchema.parse(req.params);
    const freight = await cancelFreightRecord(params.id, req.user ?? {});
    const enriched = await enrichFreightWithCompany(freight, getEnrichmentContext(req));
    return res.status(200).json({
      message: await translation('FREIGHT.CANCELLED_SUCCESSFULLY', locale),
      freight: enriched,
    });
  } catch (error) {
    if (error instanceof FreightNotFoundError) {
      return sendError(res, 404, 'FREIGHT.NOT_FOUND', locale, error);
    }
    if (error instanceof FreightForbiddenError) {
      return sendError(res, 403, 'AUTH.FORBIDDEN', locale, error);
    }
    if (error instanceof FreightValidationError) {
      return sendError(res, 400, error.code, locale, error);
    }
    if (await handleZodError(error, locale, res)) return;
    return sendError(res, 500, 'FREIGHT.CANCEL_FAILED', locale, error);
  }
};

export const completeFreight = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const params = idParamSchema.parse(req.params);
    const freight = await completeFreightRecord(params.id, req.user ?? {});
    const enriched = await enrichFreightWithCompany(freight, getEnrichmentContext(req));
    return res.status(200).json({
      message: await translation('FREIGHT.UPDATED_SUCCESSFULLY', locale),
      freight: enriched,
    });
  } catch (error) {
    if (error instanceof FreightNotFoundError) {
      return sendError(res, 404, 'FREIGHT.NOT_FOUND', locale, error);
    }
    if (error instanceof FreightForbiddenError) {
      return sendError(res, 403, 'AUTH.FORBIDDEN', locale, error);
    }
    if (error instanceof FreightValidationError) {
      return sendError(res, 400, error.code, locale, error);
    }
    if (await handleZodError(error, locale, res)) return;
    return sendError(res, 500, 'FREIGHT.UPDATE_FAILED', locale, error);
  }
};
