import express from 'express';
import {
	cancelFreight,
	completeFreight,
	createFreight,
	deleteFreight,
	getAllFreights,
	getFreightById,
	getFreightByUserId,
	getFreightHistoryByUserId,
	updateFreight,
} from '../controllers/freight.controller';
import { authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, authorizeRoles('COMPANY', 'ADMIN'), createFreight);
router.get('/', authMiddleware, getAllFreights);
router.get('/user/:id/history', authMiddleware, getFreightHistoryByUserId);
router.get('/user/:id', authMiddleware, getFreightByUserId);
router.get('/:id', authMiddleware, getFreightById);
router.put('/:id', authMiddleware, authorizeRoles('COMPANY', 'USER'), updateFreight);
router.patch('/:id/cancel', authMiddleware, authorizeRoles('COMPANY' ,'USER'), cancelFreight);
router.patch('/:id/complete', authMiddleware, authorizeRoles('COMPANY'), completeFreight);
router.delete('/:id', authMiddleware, authorizeRoles('COMPANY'), deleteFreight);

export default router;
