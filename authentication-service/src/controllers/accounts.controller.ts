import { Request, Response } from 'express';
import { Account } from '../models/accounts.model';
import AccountType from '../models/accounts_types.model';
import { translation } from '../utils/i18n';
import { getLocaleFromRequest } from '../utils/locale';
import { accountSchema } from '../schemas/account.schemas';
import { accountListQuerySchema, accountPatchSchema, subjectIdParamSchema, accountAdminCreateSchema } from '../schemas/accountAdmin.schemas';
import { createAccountRecord, createAdminAccountRecord, serializeAccountPublic } from '../services/accountCreation.service';
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
    return sendError(res, 500, await translation('ACCOUNT.CREATE_FAILED', locale), error, { ok: false });
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
    return sendError(res, 500, await translation('ACCOUNT.GET_BY_ID_FAILED', locale), error);
  }
};

export const getAccountTypes = async (_req: Request, res: Response) => {
  const locale = getLocaleFromRequest(_req);
  try {
    const types = await AccountType.findAll();
    return res.status(200).json(types);
  } catch (error) {
    return sendError(res, 500, await translation('ACCOUNT_TYPE.GET_ALL_FAILED', locale), error);
  }
};

export const getAllAccounts = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const query = accountListQuerySchema.parse(req.query);
    const offset = (query.page - 1) * query.limit;

    const { rows, count } = await Account.findAndCountAll({
      include: [{ model: AccountType, required: false }],
      order: [['id', 'ASC']],
      limit: query.limit,
      offset,
    });

    return res.status(200).json({
      items: rows,
      total: count,
      page: query.page,
      limit: query.limit,
      hasMore: offset + rows.length < count,
    });
  } catch (error) {
    const zodError = await handleZodError(error, locale);
    if (zodError) return res.status(zodError.status).json(zodError.body);
    return sendError(res, 500, await translation('ACCOUNT.GET_ALL_FAILED', locale), error);
  }
};

export const getAccountBySubjectId = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const params = subjectIdParamSchema.parse({ subjectId: req.params.subjectId });
    const account = await Account.findOne({
      where: { subject_id: params.subjectId },
      include: [{ model: AccountType, required: false }],
    });

    if (!account) {
      return sendError(res, 404, await translation('ACCOUNT.NOT_FOUND', locale));
    }

    return res.status(200).json(account);
  } catch (error) {
    const zodError = await handleZodError(error, locale);
    if (zodError) return res.status(zodError.status).json(zodError.body);
    return sendError(res, 500, await translation('ACCOUNT.GET_BY_ID_FAILED', locale), error);
  }
};

export const patchAccount = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const body = accountPatchSchema.parse(req.body);
    const account = await Account.findByPk(req.params.id as string, {
      include: [{ model: AccountType, required: false }],
    });

    if (!account) {
      return sendError(res, 404, await translation('ACCOUNT.NOT_FOUND', locale));
    }

    if (body.account_type_id !== undefined) {
      const type = await AccountType.findByPk(body.account_type_id);
      if (!type) {
        return sendError(res, 400, await translation('ACCOUNT_TYPE.NOT_FOUND', locale));
      }

      const adminType = await AccountType.findOne({ where: { name: 'ADMIN' } });
      const patchPayload: Record<string, unknown> = { ...body };

      if (adminType?.id && body.account_type_id === adminType.id) {
        patchPayload.subject_id = account.id;
      }

      if (body.email !== undefined) {
        const existing = await Account.findOne({ where: { email: body.email } });
        if (existing && existing.id !== account.id) {
          return sendError(res, 409, await translation('ACCOUNT.ALREADY_EXISTS_FOR_EMAIL', locale));
        }
      }

      await account.update(patchPayload);
    } else {
      if (body.email !== undefined) {
        const existing = await Account.findOne({ where: { email: body.email } });
        if (existing && existing.id !== account.id) {
          return sendError(res, 409, await translation('ACCOUNT.ALREADY_EXISTS_FOR_EMAIL', locale));
        }
      }

      await account.update(body);
    }

    const updated = await Account.findByPk(account.id, {
      include: [{ model: AccountType, required: false }],
    });

    return res.status(200).json({
      message: await translation('ACCOUNT.UPDATED_SUCCESSFULLY', locale),
      account: updated,
    });
  } catch (error) {
    const zodError = await handleZodError(error, locale);
    if (zodError) return res.status(zodError.status).json(zodError.body);
    return sendError(res, 500, await translation('ACCOUNT.UPDATE_FAILED', locale), error);
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
    return sendError(res, 500, await translation('ACCOUNT.DELETE_FAILED', locale), error);
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
    return sendError(res, 500, await translation('ACCOUNT.DELETE_FAILED', locale), error);
  }
};

export const createAdminAccount = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const body = accountAdminCreateSchema.parse(req.body);
    const result = await createAdminAccountRecord(body);

    if (!result.ok) {
      if (result.reason === 'exists') {
        return sendError(res, 409, await translation('ACCOUNT.ALREADY_EXISTS_FOR_EMAIL', locale));
      }
      if (result.reason === 'admin_type_missing') {
        return sendError(res, 500, await translation('ACCOUNT_TYPE.NOT_FOUND', locale));
      }
      return sendError(res, 500, await translation('ACCOUNT.CREATE_FAILED', locale));
    }

    return res.status(201).json({
      message: await translation('ACCOUNT.CREATED_SUCCESSFULLY', locale),
      account: serializeAccountPublic(result.account),
    });
  } catch (error) {
    const zodError = await handleZodError(error, locale);
    if (zodError) return res.status(zodError.status).json(zodError.body);
    return sendError(res, 500, await translation('ACCOUNT.CREATE_FAILED', locale), error);
  }
};