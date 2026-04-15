import express from 'express';
import { createFreightStatusType, deleteFreightStatusType, getAllFreightStatusTypes, getFreightStatusTypeById, updateFreightStatusType } from '../controllers/freightStatusTypes.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, createFreightStatusType);
router.get('/', authMiddleware, getAllFreightStatusTypes);
router.get('/:id', authMiddleware, getFreightStatusTypeById);
router.put('/:id', authMiddleware, updateFreightStatusType);
router.delete('/:id', authMiddleware, deleteFreightStatusType);

export default router;
