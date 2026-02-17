import express from 'express';

import { health } from '../controllers/health.controller';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateToken } from '../controllers/validate.controller';
import { login, register, verifyAuthToken } from '../controllers/login.controller';

const router = express.Router();
/*
 * @description: Realiza o login do usuário
 */
router.post('/login', login);

/*
 * @description: Registra um novo usuário
 */
router.post('/register', register);

/*
 * @description: Verifica se o servidor está online
 */
router.get('/health', health);

/*
 * @description: Valida o token
 */
router.post('/validate', validateToken);

/*
 * @description: Verifica se o token é válido
 */
router.get('/verify-token', authMiddleware, verifyAuthToken);

export default router;