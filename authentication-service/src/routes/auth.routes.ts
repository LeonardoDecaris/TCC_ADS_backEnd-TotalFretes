import express from 'express';
import { login, validateToken, verifyTokenHandler } from '../controllers/login.controller';
import { forgotPassword, validateResetCode, resetPassword } from '../controllers/forgotPassword.controller';
import { authMiddleware } from '../middleware/authMiddleware';
import sequelize from '../config/database';

const router = express.Router();

router.post('/login', login);
router.post('/validate', validateToken);
router.get('/verify-token', authMiddleware, verifyTokenHandler);
router.post('/resend-code', forgotPassword);

router.post('/forgot-password', forgotPassword);
router.post('/validate-code', validateResetCode);
router.post('/reset-password', resetPassword);

router.get('/health', async (_req, res) => {
  try {
    await sequelize.authenticate();
    return res.status(200).json({ status: 'up', database: 'connected' });
  } catch (_error) {
    return res.status(503).json({ status: 'down', database: 'disconnected' });
  }
});

export default router;
