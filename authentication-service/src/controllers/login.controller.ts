import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { Account } from '../models/accounts.model';
import AccountType from '../models/accounts_types.model';
import { generateToken, verifyToken, type JwtRole } from '../utils/jwt';

const normalizeRole = (name?: string): 'USER' | 'COMPANY' | 'ADMIN' => {
  const normalized = (name || '').trim().toUpperCase();
  if (normalized === 'COMPANY' || normalized === 'EMPRESA') return 'COMPANY';
  if (normalized === 'ADMIN' || normalized === 'ADMINISTRADOR') return 'ADMIN';
  return 'USER';
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const account = await Account.findOne({
      where: { email },
      include: [{ model: AccountType, attributes: ['name'] }],
    });

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const validPassword = await bcrypt.compare(password, account.password || '');
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const accountType = account.AccountType?.name;
    const role = normalizeRole(accountType);

    const token = generateToken({
      id: String(account.subject_id),
      role,
    });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: account.subject_id,
        role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error logging in', error });
  }
};

export const validateToken = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization?.trim();
    const bodyToken = req.body?.token;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : bodyToken;

    if (!token) {
      return res.status(401).json({ valid: false, message: 'Token inválido ou ausente.' });
    }

    const decoded = verifyToken(token) as { id?: number | string; role?: JwtRole };
    if (!decoded?.id || !decoded?.role) {
      return res.status(401).json({ valid: false, message: 'Token inválido ou expirado.' });
    }

    return res.status(200).json({
      valid: true,
      user: {
        id: Number(decoded.id),
        role: decoded.role,
      },
    });
  } catch (error) {
    return res.status(401).json({
      valid: false,
      message: 'Token inválido ou expirado.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const verifyTokenHandler = async (req: Request, res: Response) => {
  return res.status(200).json({ user: req.user });
};