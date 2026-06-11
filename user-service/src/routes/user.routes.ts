import express from 'express';
import { createUser, getUserById, getAllUsers, updateUser, deleteUser, createUserEndAccount, patchUser } from '../controllers/user.controller';
import { allowOwnerOrRoles, authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', createUser);
router.post('/end-account', createUserEndAccount);

router.get('/:id', authMiddleware, allowOwnerOrRoles('COMPANY'), getUserById);
router.get('/', authMiddleware, authorizeRoles('ADMIN'), getAllUsers);
router.patch('/:id', authMiddleware, allowOwnerOrRoles(), patchUser);
router.put('/:id', authMiddleware, allowOwnerOrRoles(), updateUser);
router.delete('/:id', authMiddleware, allowOwnerOrRoles(), deleteUser);

export default router;