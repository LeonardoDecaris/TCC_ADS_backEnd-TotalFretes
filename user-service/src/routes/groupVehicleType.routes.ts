import express from 'express';
import {
	createGroupVehicleType,
	getAllGroupVehicleTypes,
	getGroupVehicleTypeById,
	updateGroupVehicleType,
	deleteGroupVehicleType,
} from '../controllers/groupVehicleType.controller';
import { authMiddleware, authorizeRoles } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, authorizeRoles('ADMIN'), createGroupVehicleType);
router.get('/', authMiddleware, getAllGroupVehicleTypes);
router.get('/:id', authMiddleware, getGroupVehicleTypeById);
router.put('/:id', authMiddleware, authorizeRoles('ADMIN'), updateGroupVehicleType);
router.delete('/:id', authMiddleware, authorizeRoles('ADMIN'), deleteGroupVehicleType);

export default router;

