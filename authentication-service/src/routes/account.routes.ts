import express from 'express';
import { createAccount, getAccountById, getAccountTypes, deleteAccount, deleteAccountSubject } from '../controllers/accounts.controller';
import { authMiddleware, authorizeRoles } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', createAccount);
router.get('/types', getAccountTypes);
router.get('/:id', authMiddleware, authorizeRoles('ADMIN'), getAccountById);
router.delete('/:id', authMiddleware, authorizeRoles('ADMIN'), deleteAccount);
router.delete('/subject/:id', authMiddleware, authorizeRoles('USER', 'ADMIN'), deleteAccountSubject);

export default router;
