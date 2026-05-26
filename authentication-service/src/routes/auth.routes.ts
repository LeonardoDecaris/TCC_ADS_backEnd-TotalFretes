import express from 'express';
import { changePassword } from '../controllers/changePassword.controller';
import { login, validateToken, verifyTokenHandler } from '../controllers/login.controller';
import { forgotPassword, validateResetCode, resetPassword, resendCode } from '../controllers/forgotPassword.controller';
import { authMiddleware } from '../middleware/authMiddleware';
import sequelize from '../config/database';
import { checkRedis } from '../lib/redisClient';

const router = express.Router();

router.post('/login', login);
router.post('/validate', validateToken);
router.get('/verify-token', authMiddleware, verifyTokenHandler);
router.patch('/change-password', authMiddleware, changePassword);
router.post('/resend-code', resendCode);

router.post('/forgot-password', forgotPassword);
router.post('/validate-code', validateResetCode);
router.post('/reset-password', resetPassword);

router.get('/health', async (_req, res) => {
  let dbOk = false;
  try {
    await sequelize.authenticate();
    dbOk = true;
  } catch {
    dbOk = false;
  }
  const redisOk = await checkRedis();
  if (dbOk && redisOk) {
    return res.status(200).json({
      status: 'up',
      database: 'connected',
      redis: 'connected',
    });
  }
  return res.status(503).json({
    status: 'down',
    database: dbOk ? 'connected' : 'disconnected',
    redis: redisOk ? 'connected' : 'disconnected',
  });
});

export default router;
