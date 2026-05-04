import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import Account from '../models/accounts.model';
import { generateResetToken, verifyResetToken } from '../utils/jwt';
import { setResetCode, getAndConsumeResetCode } from '../store/resetCodes.store';
import { publishPasswordResetEmail } from '../messaging/email.publisher';
import { translation } from '../utils/i18n';
import { getLocaleFromRequest } from '../utils/locale';

const dispatchResetEmail = (email: string, codigo: string) =>
  publishPasswordResetEmail({ email, codigo });

export const forgotPassword = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        message: await translation('PASSWORD_RESET.EMAIL_REQUIRED', locale),
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const account = await Account.findOne({ where: { email: normalizedEmail } });

    if (!account) {
      return res.status(200).json({
        message: await translation('PASSWORD_RESET.REQUEST_ACCEPTED_GENERIC', locale),
      });
    }

    const code = await setResetCode(normalizedEmail);

    void dispatchResetEmail(normalizedEmail, code).catch((error) => {
      console.error('Erro ao publicar e-mail de recuperação na fila:', error);
    });

    return res.status(200).json({
      message: await translation('PASSWORD_RESET.REQUEST_ACCEPTED_GENERIC', locale),
    });

  } catch (error) {
    console.error('forgotPassword error:', error);
    return res.status(500).json({
      message: await translation('PASSWORD_RESET.PROCESS_REQUEST_FAILED', locale),
    });
  }
};

export const validateResetCode = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({
        message: await translation('PASSWORD_RESET.EMAIL_AND_CODE_REQUIRED', locale),
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedCode = String(code).trim();
    const isValid = await getAndConsumeResetCode(normalizedEmail, normalizedCode);
    if (!isValid) {
      return res.status(400).json({
        message: await translation('PASSWORD_RESET.CODE_INVALID_OR_EXPIRED', locale),
      });
    }

    const resetToken = generateResetToken({ email: normalizedEmail });

    return res.status(200).json({
      message: await translation('PASSWORD_RESET.CODE_VALIDATED_SUCCESSFULLY', locale),
      resetToken,
    });
  } catch (error) {
    console.error('validateResetCode error:', error);
    return res.status(500).json({
      message: await translation('PASSWORD_RESET.VALIDATION_FAILED', locale),
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const { resetToken, password } = req.body;
    if (!resetToken || !password) {
      return res.status(400).json({
        message: await translation('PASSWORD_RESET.TOKEN_AND_PASSWORD_REQUIRED', locale),
      });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({
        message: await translation('PASSWORD_RESET.PASSWORD_MIN_LENGTH', locale),
      });
    }

    let payload: { email: string };
    try {
      payload = verifyResetToken(resetToken);
    } catch {
      return res.status(400).json({
        message: await translation('PASSWORD_RESET.TOKEN_INVALID_OR_EXPIRED', locale),
      });
    }

    const account = await Account.findOne({ where: { email: payload.email } });
    if (!account) {
      return res.status(404).json({
        message: await translation('PASSWORD_RESET.ACCOUNT_NOT_FOUND', locale),
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await account.update({ password: hashedPassword });

    return res.status(200).json({
      message: await translation('PASSWORD_RESET.PASSWORD_CHANGED_SUCCESSFULLY', locale),
    });
  } catch (error) {
    console.error('resetPassword error:', error);
    return res.status(500).json({
      message: await translation('PASSWORD_RESET.RESET_FAILED', locale),
    });
  }
};

export const resendCode = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        message: await translation('PASSWORD_RESET.EMAIL_REQUIRED', locale),
      });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const account = await Account.findOne({ where: { email: normalizedEmail } });
    if (!account) {
      return res.status(200).json({
        message: await translation('PASSWORD_RESET.REQUEST_ACCEPTED_GENERIC', locale),
      });
    }

    const code = await setResetCode(normalizedEmail);
    void dispatchResetEmail(normalizedEmail, code).catch((error) => {
      console.error('Erro ao publicar e-mail de recuperação na fila:', error);
    });
    return res.status(200).json({
      message: await translation('PASSWORD_RESET.REQUEST_ACCEPTED_GENERIC', locale),
    });
  }
  catch (error) {
    console.error('resendCode error:', error);
    return res.status(500).json({
      message: await translation('PASSWORD_RESET.PROCESS_REQUEST_FAILED', locale),
    });
  }
};