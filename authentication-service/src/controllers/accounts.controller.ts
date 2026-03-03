import { Request, Response } from 'express';
import { Account } from '../models/accounts.model';
import AccountType from '../models/accounts_types.model';
import bcrypt from 'bcrypt';

const ROLE_TO_TYPE: Record<string, number> = {
  USER: 1,
  COMPANY: 2,
  ADMIN: 3,
};

const resolveAccountTypeId = async (accountTypeId?: number, accountType?: string): Promise<number | null> => {
  if (accountTypeId) return accountTypeId;
  if (!accountType) return null;
  const normalized = String(accountType).trim().toUpperCase();
  return ROLE_TO_TYPE[normalized] ?? null;
};

export const createAccount = async (req: Request, res: Response) => {
  try {
    const { email, password, account_type_id, account_type, subject_id } = req.body;
    const accountTypeId = await resolveAccountTypeId(account_type_id, account_type);
    const hashedPassword = await bcrypt.hash(password, 10);

    if (!email || !password || !subject_id || !accountTypeId) {
      return res.status(400).json({ message: 'Missing required fields', ok: false });
    }

    const existingAccount = await Account.findOne({ where: { email } });
    if (existingAccount) {
      return res.status(409).json({ message: 'Account already exists for this email', ok: false });
    }

    const account = await Account.create({
      email: email,
      password: hashedPassword,
      account_type_id: accountTypeId,
      subject_id: subject_id,
    });

    return res.status(201).json({account, ok: true });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating account', error, ok: false });
  }
};

export const getAccountById = async (req: Request, res: Response) => {
  try {
    const account = await Account.findByPk(req.params.id as string);

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    return res.status(200).json(account);
  } catch (error) {
    return res.status(500).json({ message: 'Error getting account', error });
  }
};

export const getAccountTypes = async (_req: Request, res: Response) => {
  try {
    const types = await AccountType.findAll();
    return res.status(200).json(types);
  } catch (error) {
    return res.status(500).json({ message: 'Error getting account types', error });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const account = await Account.findByPk(req.params.id as string);
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    await account.destroy();
    return res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting account', error });
  }
};
