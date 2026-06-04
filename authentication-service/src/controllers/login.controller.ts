import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { Account } from '../models/accounts.model';
import AccountType from '../models/accounts_types.model';
import { generateToken, verifyToken, type JwtRole } from '../utils/jwt';
import { translation } from '../utils/i18n';
import { getLocaleFromRequest } from '../utils/locale';
import { loginSchema } from '../schemas/login.schemas';
import { getCompanyPaymentStatus } from '../services/companyService';
import { sendError } from '../utils/httpResponse';
import { handleZodError } from '../utils/zodError';

export const login = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const body = loginSchema.parse(req.body);

    const account = await Account.findOne({
      where: { email: body.email },
      include: [{
        model: AccountType,
        attributes: ['name']
      }],
    });

    if (!account) {
      return sendError(res, 404, await translation('ACCOUNT.NOT_FOUND', locale));
    }

    const validPassword = await bcrypt.compare(body.password, account.password || '');
    if (!validPassword) {
      return sendError(res, 401, await translation('AUTH.INVALID_PASSWORD', locale));
    }

    const accountTypeName = account.AccountType?.name;

    if (accountTypeName === 'COMPANY' && account.subject_id != null) {
      const isPaid = await getCompanyPaymentStatus(Number(account.subject_id));

      if (isPaid === false) {
        return sendError(res, 403, await translation('AUTH.PAYMENT_PENDING', locale), {
          code: 'PAYMENT_PENDING',
        });
      }
    }

    const token = generateToken({ id: account?.subject_id, role: accountTypeName as JwtRole });

    return res.status(200).json({
      message: await translation('AUTH.LOGIN_SUCCESSFUL', locale),
      token,
    });
  } catch (error) {
    const zodError = await handleZodError(error, locale);
    if (zodError) return res.status(zodError.status).json(zodError.body);
    return sendError(res, 500, await translation('AUTH.LOGIN_FAILED', locale), error);
  }
};

export const validateToken = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const authHeader = req.headers.authorization?.trim();
    const bodyToken = req.body?.token;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : bodyToken;

    if (!token) {
      return sendError(res, 401, await translation('AUTH.TOKEN_INVALID_OR_MISSING', locale), { valid: false });
    }

    const decoded = verifyToken(token) as { id?: number | string; role?: JwtRole };
    if (!decoded?.id || !decoded?.role) {
      return sendError(res, 401, await translation('AUTH.TOKEN_INVALID_OR_EXPIRED', locale), { valid: false });
    }

    const subjectId = Number(decoded.id);
    const account = await Account.findOne({ where: { subject_id: subjectId } });
    if (!account) {
      return sendError(res, 401, await translation('AUTH.TOKEN_INVALID_OR_EXPIRED', locale), { valid: false });
    }

    return res.status(200).json({
      valid: true,
      ok: true,
    });
  } catch (error) {
    return sendError(res, 401, await translation('AUTH.TOKEN_INVALID_OR_EXPIRED', locale), error, {
      valid: false,
    });
  }
};

export const verifyTokenHandler = async (req: Request, res: Response) => {
  return res.status(200).json({ user: req.user });
};