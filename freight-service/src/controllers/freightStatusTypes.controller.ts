import { Request, Response } from 'express';
import {
  FREIGHT_STATUS_TYPES_CACHE_KEY,
  getCachedCatalog,
  invalidateFreightStatusTypesCache,
  setCachedCatalog,
} from '../cache/catalogCache';
import FreightStatusType from '../models/freightStatusTypes.model';
import { createFreightStatusTypeSchema, updateFreightStatusTypeSchema } from '../schemas/freightStatusTypes.schemas';
import { idParamSchema } from '../schemas/common.schemas';
import { sendError } from '../services/httpResponse';
import { translation } from '../utils/i18n';
import { getLocaleFromRequest } from '../utils/locale';
import { handleZodError } from '../utils/zodError';

export const createFreightStatusType = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const body = createFreightStatusTypeSchema.parse(req.body);
    const freightStatusType = await FreightStatusType.create(body);
    await invalidateFreightStatusTypesCache();
    return res.status(201).json({
      message: await translation('FREIGHT_STATUS_TYPE.CREATED_SUCCESSFULLY', locale),
      freightStatusType,
    });
  } catch (error) {
    if (await handleZodError(error, locale, res)) return;
    return sendError(res, 500, 'FREIGHT_STATUS_TYPE.CREATE_FAILED', locale, error);
  }
};

export const getAllFreightStatusTypes = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const cached = await getCachedCatalog<unknown[]>(FREIGHT_STATUS_TYPES_CACHE_KEY);
    if (cached) {
      return res.status(200).json(cached);
    }

    const freightStatusTypes = await FreightStatusType.findAll();
    const payload = freightStatusTypes.map((item) => item.toJSON());
    await setCachedCatalog(FREIGHT_STATUS_TYPES_CACHE_KEY, payload);
    return res.status(200).json(payload);
  } catch (error) {
    return sendError(res, 500, 'FREIGHT_STATUS_TYPE.GET_ALL_FAILED', locale, error);
  }
};

export const getFreightStatusTypeById = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const params = idParamSchema.parse(req.params);
    const freightStatusType = await FreightStatusType.findByPk(params.id);
    if (!freightStatusType) {
      return sendError(res, 404, 'FREIGHT_STATUS_TYPE.NOT_FOUND', locale);
    }
    return res.status(200).json(freightStatusType);
  } catch (error) {
    if (await handleZodError(error, locale, res)) return;
    return sendError(res, 500, 'FREIGHT_STATUS_TYPE.GET_BY_ID_FAILED', locale, error);
  }
};

export const updateFreightStatusType = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const params = idParamSchema.parse(req.params);
    const body = updateFreightStatusTypeSchema.parse(req.body);
    const freightStatusType = await FreightStatusType.findByPk(params.id);
    if (!freightStatusType) {
      return sendError(res, 404, 'FREIGHT_STATUS_TYPE.NOT_FOUND', locale);
    }
    await freightStatusType.update(body);
    await invalidateFreightStatusTypesCache();
    return res.status(200).json({
      message: await translation('FREIGHT_STATUS_TYPE.UPDATED_SUCCESSFULLY', locale),
      freightStatusType,
    });
  } catch (error) {
    if (await handleZodError(error, locale, res)) return;
    return sendError(res, 500, 'FREIGHT_STATUS_TYPE.UPDATE_FAILED', locale, error);
  }
};

export const deleteFreightStatusType = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const params = idParamSchema.parse(req.params);
    const freightStatusType = await FreightStatusType.findByPk(params.id);
    if (!freightStatusType) {
      return sendError(res, 404, 'FREIGHT_STATUS_TYPE.NOT_FOUND', locale);
    }
    await freightStatusType.destroy();
    await invalidateFreightStatusTypesCache();
    return res.status(200).json({
      message: await translation('FREIGHT_STATUS_TYPE.DELETED_SUCCESSFULLY', locale),
    });
  } catch (error) {
    if (await handleZodError(error, locale, res)) return;
    return sendError(res, 500, 'FREIGHT_STATUS_TYPE.DELETE_FAILED', locale, error);
  }
};
