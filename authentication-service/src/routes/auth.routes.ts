import express from 'express';
import { login, validateToken, verifyTokenHandler } from '../controllers/login.controller';
import { authMiddleware } from '../middleware/authMiddleware';
import sequelize from '../config/database';

const router = express.Router();

router.post('/login', login);
router.post('/validate', validateToken);
router.get('/verify-token', authMiddleware, verifyTokenHandler);

router.get('/health', async (_req, res) => {
  try {
    await sequelize.authenticate();
    return res.status(200).json({ status: 'up', database: 'connected' });
  } catch (_error) {
    return res.status(503).json({ status: 'down', database: 'disconnected' });
  }
});

export default router;
