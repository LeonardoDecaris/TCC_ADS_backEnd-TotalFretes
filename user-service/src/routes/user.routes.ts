import express from 'express';
import { createUser, getUserById, getAllUsers, updateUser, deleteUser, createUserEndAccount, pacheUser } from '../controllers/user.controller';
import { allowOwnerOrRoles, authMiddleware, authorizeRoles } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', createUser);
router.post('/end-account', createUserEndAccount);

router.get('/:id', authMiddleware, allowOwnerOrRoles(), getUserById);
router.get('/', authMiddleware, authorizeRoles('ADMIN'), getAllUsers);
router.patch('/:id', authMiddleware, allowOwnerOrRoles(), pacheUser);
router.put('/:id', authMiddleware, allowOwnerOrRoles(), updateUser);
router.delete('/:id', authMiddleware, allowOwnerOrRoles(), deleteUser);

export default router;