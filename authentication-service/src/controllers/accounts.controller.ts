// authentication-service/src/controllers/accounts.controller.ts

import { Request, Response } from 'express';
import { Account } from '../models/accounts.model';
import AccountType from '../models/accounts_types.model';
import { translation } from '../utils/i18n';
import { getLocaleFromRequest } from '../utils/locale';
import { accountSchema } from '../schemas/account.schemas';
import { createAccountRecord } from '../services/accountCreation.service';

export const createAccount = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const body = accountSchema.parse(req.body);

    const result = await createAccountRecord(body);
    if (!result.ok) {
      if (result.reason === 'exists') {
        return res.status(409).json({
          message: await translation('ACCOUNT.ALREADY_EXISTS_FOR_EMAIL', locale),
          ok: false,
        });
      }
      if (result.reason === 'validation') {
        return res.status(400).json({
          message: await translation('ACCOUNT.CREATE_FAILED', locale),
          ok: false,
        });
      }
      return res.status(500).json({
        message: await translation('ACCOUNT.CREATE_FAILED', locale),
        ok: false,
      });
    }

    return res.status(201).json({
      message: await translation('ACCOUNT.CREATED_SUCCESSFULLY', locale),
      ok: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: await translation('ACCOUNT.CREATE_FAILED', locale),
      error,
      ok: false,
    });
  }
};

export const getAccountById = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const account = await Account.findByPk(req.params.id as string);

    if (!account) {
      return res.status(404).json({
        message: await translation('ACCOUNT.NOT_FOUND', locale),
      });
    }

    return res.status(200).json(account);
  } catch (error) {
    return res.status(500).json({
      message: await translation('ACCOUNT.GET_BY_ID_FAILED', locale),
      error,
    });
  }
};

export const getAccountTypes = async (_req: Request, res: Response) => {
  const locale = getLocaleFromRequest(_req);
  try {
    const types = await AccountType.findAll();
    return res.status(200).json(types);
  } catch (error) {
    return res.status(500).json({
      message: await translation('ACCOUNT_TYPE.GET_ALL_FAILED', locale),
      error,
    });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const account = await Account.findByPk(req.params.id as string);

    if (!account) {
      return res.status(404).json({
        message: await translation('ACCOUNT.NOT_FOUND', locale),
      });
    }

    await account.destroy();
    return res.status(200).json({
      message: await translation('ACCOUNT.DELETED_SUCCESSFULLY', locale),
    });
  } catch (error) {
    return res.status(500).json({
      message: await translation('ACCOUNT.DELETE_FAILED', locale),
      error,
    });
  }
};
