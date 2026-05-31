import { Request, Response } from 'express';
import CargoType from '../models/cargoTypes.model';
import { createCargoTypeSchema, updateCargoTypeSchema } from '../schemas/cargoTypes.schemas';
import { idParamSchema } from '../schemas/common.schemas';
import { sendError } from '../services/httpResponse';
import { translation } from '../utils/i18n';
import { getLocaleFromRequest } from '../utils/locale';
import { handleZodError } from '../utils/zodError';

export const createCargoType = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const body = createCargoTypeSchema.parse(req.body);
    const cargoType = await CargoType.create(body);
    return res.status(201).json({
      message: await translation('CARGO_TYPE.CREATED_SUCCESSFULLY', locale),
      cargoType,
    });
  } catch (error) {
    if (await handleZodError(error, locale, res)) return;
    return sendError(res, 500, 'CARGO_TYPE.CREATE_FAILED', locale);
  }
};

export const getAllCargoTypes = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const cargoTypes = await CargoType.findAll();
    return res.status(200).json(cargoTypes);
  } catch (error) {
    return sendError(res, 500, 'CARGO_TYPE.GET_ALL_FAILED', locale);
  }
};

export const getCargoTypeById = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const params = idParamSchema.parse(req.params);
    const cargoType = await CargoType.findByPk(params.id);
    if (!cargoType) {
      return sendError(res, 404, 'CARGO_TYPE.NOT_FOUND', locale);
    }
    return res.status(200).json(cargoType);
  } catch (error) {
    if (await handleZodError(error, locale, res)) return;
    return sendError(res, 500, 'CARGO_TYPE.GET_BY_ID_FAILED', locale);
  }
};

export const updateCargoType = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const params = idParamSchema.parse(req.params);
    const body = updateCargoTypeSchema.parse(req.body);
    const cargoType = await CargoType.findByPk(params.id);
    if (!cargoType) {
      return sendError(res, 404, 'CARGO_TYPE.NOT_FOUND', locale);
    }
    await cargoType.update(body);
    return res.status(200).json({
      message: await translation('CARGO_TYPE.UPDATED_SUCCESSFULLY', locale),
      cargoType,
    });
  } catch (error) {
    if (await handleZodError(error, locale, res)) return;
    return sendError(res, 500, 'CARGO_TYPE.UPDATE_FAILED', locale);
  }
};

export const deleteCargoType = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const params = idParamSchema.parse(req.params);
    const cargoType = await CargoType.findByPk(params.id);
    if (!cargoType) {
      return sendError(res, 404, 'CARGO_TYPE.NOT_FOUND', locale);
    }
    await cargoType.destroy();
    return res.status(200).json({
      message: await translation('CARGO_TYPE.DELETED_SUCCESSFULLY', locale),
    });
  } catch (error) {
    if (await handleZodError(error, locale, res)) return;
    return sendError(res, 500, 'CARGO_TYPE.DELETE_FAILED', locale);
  }
};
