import express from 'express';
import {
	createVehicle,
	createVehicleAndAttachToUser,
	getAllVehicles,
	getVehicleById,
	updateVehicle,
	deleteVehicle,
} from '../controllers/vehicle.controller';
import { authMiddleware, authorizeRoles } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, createVehicle);
router.post('/register', authMiddleware, createVehicleAndAttachToUser);
router.get('/', authMiddleware, authorizeRoles('ADMIN'), getAllVehicles);
router.get('/:id', authMiddleware, authorizeRoles('ADMIN', 'USER', 'COMPANY'), getVehicleById);
router.put('/:id', authMiddleware, authorizeRoles('ADMIN', 'USER'), updateVehicle);
router.delete('/:id', authMiddleware, authorizeRoles('ADMIN', "USER"), deleteVehicle);

export default router;

