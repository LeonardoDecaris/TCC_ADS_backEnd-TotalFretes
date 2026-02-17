import express from 'express';
import { createUser, getUserById, getAllUsers, updateUser, deleteUser } from '../controllers/user.controller';

const router = express.Router();

router.post('/', createUser);
router.get('/:id', getUserById);
router.get('/', getAllUsers);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;