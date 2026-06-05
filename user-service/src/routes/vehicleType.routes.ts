import express from 'express';
import {
	createVehicleType,
	getAllVehicleTypes,
	getVehicleTypeById,
	updateVehicleType,
	deleteVehicleType,
} from '../controllers/vehicleType.controller';
import { authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, authorizeRoles('ADMIN'), createVehicleType);
router.get('/', authMiddleware, getAllVehicleTypes);
router.get('/:id', authMiddleware, getVehicleTypeById);
router.put('/:id', authMiddleware, authorizeRoles('ADMIN'), updateVehicleType);
router.delete('/:id', authMiddleware, authorizeRoles('ADMIN'), deleteVehicleType);

export default router;

