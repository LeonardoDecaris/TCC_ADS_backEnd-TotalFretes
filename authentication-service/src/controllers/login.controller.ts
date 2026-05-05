import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { Account } from '../models/accounts.model';
import AccountType from '../models/accounts_types.model';
import { generateToken, verifyToken, type JwtRole } from '../utils/jwt';
import { translation } from '../utils/i18n';
import { getLocaleFromRequest } from '../utils/locale';
import { loginSchema } from '../schemas/login.schemas';

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
      return res.status(404).json({
        message: await translation('ACCOUNT.NOT_FOUND', locale),
      });
    }

    const validPassword = await bcrypt.compare(body.password, account.password || '');
    if (!validPassword) {
      return res.status(401).json({
        message: await translation('AUTH.INVALID_PASSWORD', locale),
      });
    }

    const token = generateToken({ id: account?.subject_id, role: account.AccountType?.name as JwtRole });

    return res.status(200).json({
      message: await translation('AUTH.LOGIN_SUCCESSFUL', locale),
      token,
    });
  } catch (error) {
    return res.status(500).json({
      message: await translation('AUTH.LOGIN_FAILED', locale),
      error,
    });
  }
};

export const validateToken = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const authHeader = req.headers.authorization?.trim();
    const bodyToken = req.body?.token;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : bodyToken;

    if (!token) {
      return res.status(401).json({
        valid: false,
        message: await translation('AUTH.TOKEN_INVALID_OR_MISSING', locale),
      });
    }

    const decoded = verifyToken(token) as { id?: number | string; role?: JwtRole };
    if (!decoded?.id || !decoded?.role) {
      return res.status(401).json({
        valid: false,
        message: await translation('AUTH.TOKEN_INVALID_OR_EXPIRED', locale),
      });
    }

    const subjectId = Number(decoded.id);
    const account = await Account.findOne({ where: { subject_id: subjectId } });
    if (!account) {
      return res.status(401).json({
        valid: false,
        message: await translation('AUTH.TOKEN_INVALID_OR_EXPIRED', locale),
      });
    }

    return res.status(200).json({
      valid: true,
      ok: true,
    });
  } catch (error) {
    return res.status(401).json({
      valid: false,
      message: await translation('AUTH.TOKEN_INVALID_OR_EXPIRED', locale),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const verifyTokenHandler = async (req: Request, res: Response) => {
  return res.status(200).json({ user: req.user });
};