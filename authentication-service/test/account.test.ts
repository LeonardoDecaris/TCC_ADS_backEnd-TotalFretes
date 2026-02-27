import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../src/app';
import { Account } from '../src/models/accounts.model';
import AccountType from '../src/models/accounts_types.model';

jest.mock('../src/middleware/authMiddleware', () => ({
  authMiddleware: (req: any, _res: any, next: any) => {
    req.user = { id: 1, role: 'ADMIN' };
    next();
  },
  authorizeRoles: () => (_req: any, _res: any, next: any) => next(),
}));

jest.mock('bcrypt', () => ({
  __esModule: true,
  default: {
    hash: jest.fn(),
  },
}));

jest.mock('../src/models/accounts.model', () => ({
  __esModule: true,
  Account: {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
  },
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
  },
}));

jest.mock('../src/models/accounts_types.model', () => ({
  __esModule: true,
  default: {
    findAll: jest.fn(),
  },
}));

describe('Account routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /account', () => {
    it('returns 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/account')
        .send({ email: 'user@email.com', password: '123456' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Missing required fields' });
    });

    it('returns 400 when account type is invalid', async () => {
      const response = await request(app).post('/account').send({
        email: 'user@email.com',
        password: '123456',
        subject_id: 7,
        account_type: 'INVALID',
      });

      expect(response.status).toBe(400);
    });

    it('returns 409 when account already exists', async () => {
      (Account.findOne as jest.Mock).mockResolvedValue({ id: 1, email: 'user@email.com' });

      const response = await request(app).post('/account').send({
        email: 'user@email.com',
        password: '123456',
        subject_id: 7,
        account_type: 'USER',
      });

      expect(response.status).toBe(409);
      expect(response.body).toEqual({ message: 'Account already exists for this email' });
    });

    it('returns 201 and account data when creation succeeds', async () => {
      (Account.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      (Account.create as jest.Mock).mockResolvedValue({
        id: 11,
        email: 'user@email.com',
        account_type_id: 1,
        subject_id: 77,
      });

      const response = await request(app).post('/account').send({
        email: 'user@email.com',
        password: '123456',
        subject_id: 77,
        account_type: 'USER',
      });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        id: 11,
        email: 'user@email.com',
        account_type_id: 1,
        subject_id: 77,
      });
    });
  });

  describe('GET /account/types', () => {
    it('returns 200 with account types', async () => {
      (AccountType.findAll as jest.Mock).mockResolvedValue([
        { id: 1, name: 'USER' },
        { id: 2, name: 'COMPANY' },
      ]);

      const response = await request(app).get('/account/types');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        { id: 1, name: 'USER' },
        { id: 2, name: 'COMPANY' },
      ]);
    });
  });

  describe('GET /account/:id', () => {
    it('returns 404 when account does not exist', async () => {
      (Account.findByPk as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/account/123');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Account not found' });
    });

    it('returns 200 when account exists', async () => {
      (Account.findByPk as jest.Mock).mockResolvedValue({
        id: 123,
        email: 'user@email.com',
        account_type_id: 1,
        subject_id: 42,
      });

      const response = await request(app).get('/account/123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: 123,
        email: 'user@email.com',
        account_type_id: 1,
        subject_id: 42,
      });
    });
  });

  describe('DELETE /account/:id', () => {
    it('returns 404 when account does not exist', async () => {
      (Account.findByPk as jest.Mock).mockResolvedValue(null);

      const response = await request(app).delete('/account/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Account not found' });
    });

    it('returns 200 when account is deleted', async () => {
      const destroy = jest.fn().mockResolvedValue(undefined);
      (Account.findByPk as jest.Mock).mockResolvedValue({ destroy });

      const response = await request(app).delete('/account/999');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Account deleted successfully' });
      expect(destroy).toHaveBeenCalledTimes(1);
    });
  });
});
