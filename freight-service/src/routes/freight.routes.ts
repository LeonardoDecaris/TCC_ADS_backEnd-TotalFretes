import express from 'express';
import { createFreight, deleteFreight, getAllFreights, getFreightById, getFreightByUserId, updateFreight } from '../controllers/freight.controller';
import { authMiddleware, authorizeRoles } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, authorizeRoles('COMPANY'), createFreight);
router.get('/', authMiddleware, getAllFreights);
router.get('/:id', authMiddleware, getFreightById);
router.get('/user/:id', authMiddleware, getFreightByUserId);
router.put('/:id', authMiddleware, authorizeRoles('COMPANY'), updateFreight);
router.delete('/:id', authMiddleware, authorizeRoles('COMPANY'), deleteFreight);

export default router;
