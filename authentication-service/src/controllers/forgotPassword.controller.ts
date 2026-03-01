import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import Account from '../models/accounts.model';

import axios from 'axios';
import { generateResetToken, verifyResetToken } from '../utils/jwt';
import { setResetCode, getAndConsumeResetCode } from '../store/resetCodes.store';

const EMAIL_MANAGEMENT_SERVICE_URL = process.env.EMAIL_MANAGEMENT_SERVICE_URL;

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email é obrigatório' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const account = await Account.findOne({ where: { email: normalizedEmail } });

    if (!account) {
      return res.status(404).json({ message: 'Nenhuma conta encontrada com este email' });
    }

    const code = setResetCode(normalizedEmail);

    try {
      await axios.post(`${EMAIL_MANAGEMENT_SERVICE_URL}/enviar-codigo`, {
        email: normalizedEmail,
        codigo: code,
      });
    } catch (error) {
      console.error('Erro ao chamar email-management-service:', error);
      return res.status(500).json({ message: 'Erro ao enviar email de redefinição' });
    }

    return res.status(200).json({
      message: 'Se este email estiver cadastrado, você receberá instruções em breve.',
    });

  } catch (error) {
    console.error('forgotPassword error:', error);
    return res.status(500).json({ message: 'Erro ao processar solicitação' });
  }
};

export const validateResetCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: 'Email e código são obrigatórios' });
    }

    const isValid = getAndConsumeResetCode(email, code);
    if (!isValid) {
      return res.status(400).json({ message: 'Código inválido ou expirado' });
    }

    const resetToken = generateResetToken({ email: email.trim().toLowerCase() });

    return res.status(200).json({
      message: 'Código validado com sucesso',
      resetToken,
    });
  } catch (error) {
    console.error('validateResetCode error:', error);
    return res.status(500).json({ message: 'Erro ao validar código' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { resetToken, password } = req.body;
    if (!resetToken || !password) {
      return res.status(400).json({ message: 'Token e nova senha são obrigatórios' });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ message: 'Senha deve ter no mínimo 8 caracteres' });
    }

    let payload: { email: string };
    try {
      payload = verifyResetToken(resetToken);
    } catch {
      return res.status(400).json({ message: 'Token inválido ou expirado' });
    }

    const account = await Account.findOne({ where: { email: payload.email } });
    if (!account) {
      return res.status(404).json({ message: 'Conta não encontrada' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await account.update({ password: hashedPassword });

    return res.status(200).json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('resetPassword error:', error);
    return res.status(500).json({ message: 'Erro ao redefinir senha' });
  }
};
