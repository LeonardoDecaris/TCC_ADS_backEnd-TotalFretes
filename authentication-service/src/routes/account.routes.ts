import express from 'express';
import { createAccount, getAccountById, getAccountTypes, deleteAccount, deleteAccountSubject, getAllAccounts, getAccountBySubjectId, patchAccount, createAdminAccount } from '../controllers/accounts.controller';
import { allowOwnerOrRoles, authMiddleware, authorizeRoles } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', createAccount);
router.post('/admin', authMiddleware, authorizeRoles('ADMIN'), createAdminAccount);
router.get('/types', getAccountTypes);
router.get('/', authMiddleware, authorizeRoles('ADMIN'), getAllAccounts);
router.get('/subject/:subjectId', authMiddleware, authorizeRoles('ADMIN'), getAccountBySubjectId);
router.get('/:id', authMiddleware, authorizeRoles('ADMIN'), getAccountById);
router.patch('/:id', authMiddleware, authorizeRoles('ADMIN'), patchAccount);
router.delete('/:id', authMiddleware, authorizeRoles('ADMIN'), deleteAccount);
router.delete('/subject/:id', authMiddleware, allowOwnerOrRoles(), deleteAccountSubject);

export default router;
