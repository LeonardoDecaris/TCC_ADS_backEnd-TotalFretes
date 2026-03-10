import express from 'express';
import {
	createVehicle,
	getAllVehicles,
	getVehicleById,
	updateVehicle,
	deleteVehicle,
} from '../controllers/vehicle.controller';
import { authMiddleware, authorizeRoles } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, authorizeRoles('ADMIN'), createVehicle);
router.get('/', authMiddleware, authorizeRoles('ADMIN'), getAllVehicles);
router.get('/:id', authMiddleware, authorizeRoles('ADMIN'), getVehicleById);
router.put('/:id', authMiddleware, authorizeRoles('ADMIN'), updateVehicle);
router.delete('/:id', authMiddleware, authorizeRoles('ADMIN'), deleteVehicle);

export default router;

