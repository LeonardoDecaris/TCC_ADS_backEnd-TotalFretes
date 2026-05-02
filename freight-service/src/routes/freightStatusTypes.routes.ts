import express from 'express';
import { createFreightStatusType, deleteFreightStatusType, getAllFreightStatusTypes, getFreightStatusTypeById, updateFreightStatusType } from '../controllers/freightStatusTypes.controller';
import { authMiddleware, authorizeRoles } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, authorizeRoles('ADMIN'), createFreightStatusType);
router.get('/', authMiddleware, getAllFreightStatusTypes);
router.get('/:id', authMiddleware, getFreightStatusTypeById);
router.put('/:id', authMiddleware, authorizeRoles('ADMIN'), updateFreightStatusType);
router.delete('/:id', authMiddleware, authorizeRoles('ADMIN'), deleteFreightStatusType);

export default router;
