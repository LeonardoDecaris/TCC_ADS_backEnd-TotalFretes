import { Request, Response } from 'express';
import { Account } from '../models/accounts.model';
import AccountType from '../models/accounts_types.model';
import { translation } from '../utils/i18n';
import { getLocaleFromRequest } from '../utils/locale';
import { accountSchema } from '../schemas/account.schemas';
import { createAccountRecord } from '../services/accountCreation.service';
import { sendError } from '../utils/httpResponse';
import { handleZodError } from '../utils/zodError';

export const createAccount = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const body = accountSchema.parse(req.body);

    const result = await createAccountRecord(body);
    if (!result.ok) {
      if (result.reason === 'exists') {
        return sendError(res, 409, await translation('ACCOUNT.ALREADY_EXISTS_FOR_EMAIL', locale), { ok: false });
      }
      return sendError(res, 500, await translation('ACCOUNT.CREATE_FAILED', locale), { ok: false });
    }

    return res.status(201).json({
      message: await translation('ACCOUNT.CREATED_SUCCESSFULLY', locale),
      ok: true,
    });
  } catch (error) {
    const zodError = await handleZodError(error, locale);
    if (zodError) return res.status(zodError.status).json(zodError.body);
    return sendError(res, 500, await translation('ACCOUNT.CREATE_FAILED', locale), { error, ok: false });
  }
};

export const getAccountById = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const account = await Account.findByPk(req.params.id as string);

    if (!account) {
      return sendError(res, 404, await translation('ACCOUNT.NOT_FOUND', locale));
    }

    return res.status(200).json(account);
  } catch (error) {
    return sendError(res, 500, await translation('ACCOUNT.GET_BY_ID_FAILED', locale), { error });
  }
};

export const getAccountTypes = async (_req: Request, res: Response) => {
  const locale = getLocaleFromRequest(_req);
  try {
    const types = await AccountType.findAll();
    return res.status(200).json(types);
  } catch (error) {
    return sendError(res, 500, await translation('ACCOUNT_TYPE.GET_ALL_FAILED', locale), { error });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const account = await Account.findByPk(req.params.id as string);

    if (!account) {
      return sendError(res, 404, await translation('ACCOUNT.NOT_FOUND', locale));
    }

    await account.destroy();
    return res.status(200).json({
      message: await translation('ACCOUNT.DELETED_SUCCESSFULLY', locale),
    });
  } catch (error) {
    return sendError(res, 500, await translation('ACCOUNT.DELETE_FAILED', locale), { error });
  }
};

export const deleteAccountSubject = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const account = await Account.findOne({ where: { subject_id: req.params.id as string } });

    if (!account) {
      return sendError(res, 404, await translation('ACCOUNT.NOT_FOUND', locale));
    }

    await account.destroy();
    return res.status(200).json({
      message: await translation('ACCOUNT.DELETED_SUCCESSFULLY', locale),
    });
  } catch (error) {
    return sendError(res, 500, await translation('ACCOUNT.DELETE_FAILED', locale), { error });
  }
};