import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../src/app';
import { Account } from '../src/models/accounts.model';
import { generateToken, verifyToken } from '../src/utils/jwt';

jest.mock('bcrypt', () => ({
  __esModule: true,
  default: {
    compare: jest.fn(),
  },
}));

jest.mock('../src/models/accounts.model', () => ({
  __esModule: true,
  Account: {
    findOne: jest.fn(),
  },
  default: {
    findOne: jest.fn(),
  },
}));

jest.mock('../src/utils/jwt', () => ({
  __esModule: true,
  generateToken: jest.fn(),
  verifyToken: jest.fn(),
}));

describe('Authentication routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    it('returns 400 when email or password is missing', async () => {
      const response = await request(app).post('/auth/login').send({ email: 'user@email.com' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Email and password are required' });
    });

    it('returns 404 when account is not found', async () => {
      (Account.findOne as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'missing@email.com', password: '123456' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Account not found' });
    });

    it('returns 401 when password is invalid', async () => {
      (Account.findOne as jest.Mock).mockResolvedValue({
        password: 'hashed-password',
        subject_id: 22,
        AccountType: { name: 'USER' },
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'user@email.com', password: 'wrong-password' });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Invalid password' });
    });

    it('returns token and user data when login is successful', async () => {
      (Account.findOne as jest.Mock).mockResolvedValue({
        password: 'hashed-password',
        subject_id: 10,
        AccountType: { name: 'EMPRESA' },
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (generateToken as jest.Mock).mockReturnValue('mock-jwt-token');

      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'empresa@email.com', password: 'valid-password' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Login successful',
        token: 'mock-jwt-token',
        user: {
          id: 10,
          role: 'COMPANY',
        },
      });
    });
  });

  describe('POST /auth/validate', () => {
    it('returns 401 when token is missing', async () => {
      const response = await request(app).post('/auth/validate').send({});

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ valid: false, message: 'Token inválido ou ausente.' });
    });

    it('returns 200 when token is valid', async () => {
      (verifyToken as jest.Mock).mockReturnValue({ id: '11', role: 'ADMIN' });

      const response = await request(app)
        .post('/auth/validate')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        valid: true,
        user: {
          id: 11,
          role: 'ADMIN',
        },
      });
    });

    it('returns 401 when token verification throws error', async () => {
      (verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('invalid token');
      });

      const response = await request(app)
        .post('/auth/validate')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.valid).toBe(false);
      expect(response.body.message).toBe('Token inválido ou expirado.');
    });
  });
});
