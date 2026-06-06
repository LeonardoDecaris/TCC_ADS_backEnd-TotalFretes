import express from 'express';
import { createCnhType, getAllCnhTypes, getCnhTypeById, updateCnhType, deleteCnhType } from '../controllers/cnh.controller';
import { authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, authorizeRoles('ADMIN'), createCnhType);
router.get('/', authMiddleware, authorizeRoles('ADMIN'), getAllCnhTypes);
router.get('/:id', authMiddleware, authorizeRoles('ADMIN'), getCnhTypeById);
router.put('/:id', authMiddleware, authorizeRoles('ADMIN'), updateCnhType);
router.delete('/:id', authMiddleware, authorizeRoles('ADMIN'), deleteCnhType);

export default router;