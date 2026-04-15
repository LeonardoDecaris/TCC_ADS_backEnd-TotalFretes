import express from 'express';
import { createFreight, deleteFreight, getAllFreights, getFreightById, updateFreight } from '../controllers/freight.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, createFreight);
router.get('/', authMiddleware, getAllFreights);
router.get('/:id', authMiddleware, getFreightById);
router.put('/:id', authMiddleware, updateFreight);
router.delete('/:id', authMiddleware, deleteFreight);

export default router;
