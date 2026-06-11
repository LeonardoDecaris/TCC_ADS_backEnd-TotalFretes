import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';

import Account from '../models/accounts.model';
import { findAccountByTokenClaims } from '../services/accountToken.service';
import { translation } from '../utils/i18n';
import type { JwtRole } from '../utils/jwt';
import { getLocaleFromRequest } from '../utils/locale';
import { sendError } from '../utils/httpResponse';

export const changePassword = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);

  try {
    const tokenId = req.user?.id;
    const tokenRole = req.user?.role as JwtRole | undefined;
    const { currentPassword, newPassword } = req.body ?? {};

    if (!tokenId || !tokenRole) {
      return sendError(res, 401, await translation('AUTH.TOKEN_INVALID_OR_MISSING', locale));
    }

    if (
      typeof currentPassword !== 'string' ||
      typeof newPassword !== 'string' ||
      !currentPassword.trim() ||
      !newPassword.trim()
    ) {
      return sendError(
        res,
        400,
        await translation('AUTH.CURRENT_AND_NEW_PASSWORD_REQUIRED', locale),
      );
    }

    if (newPassword.length < 8) {
      return sendError(res, 400, await translation('PASSWORD_RESET.PASSWORD_MIN_LENGTH', locale));
    }

    if (currentPassword === newPassword) {
      return sendError(res, 400, await translation('AUTH.NEW_PASSWORD_MUST_DIFFER', locale));
    }

    const account = await findAccountByTokenClaims({ id: tokenId, role: tokenRole });

    if (!account) {
      return sendError(res, 404, await translation('ACCOUNT.NOT_FOUND', locale));
    }

    const validPassword = await bcrypt.compare(currentPassword, account.password || '');

    if (!validPassword) {
      return sendError(res, 401, await translation('AUTH.INVALID_PASSWORD', locale));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await account.update({ password: hashedPassword });

    return res.status(200).json({
      message: await translation('AUTH.PASSWORD_CHANGED_SUCCESSFULLY', locale),
    });
  } catch (error) {
    return sendError(res, 500, await translation('AUTH.CHANGE_PASSWORD_FAILED', locale), error);
  }
};
