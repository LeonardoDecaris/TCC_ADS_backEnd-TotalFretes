import express from 'express';
import { createUser, getUserById, getAllUsers, updateUser, deleteUser } from '../controllers/user.controller';
import { allowOwnerOrRoles, authMiddleware, authorizeRoles } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', createUser);
router.get('/:id', authMiddleware, allowOwnerOrRoles(), getUserById);
router.get('/', authMiddleware, authorizeRoles('ADMIN'), getAllUsers);
router.put('/:id', authMiddleware, allowOwnerOrRoles(), updateUser);
router.delete('/:id', authMiddleware, allowOwnerOrRoles(), deleteUser);

export default router;