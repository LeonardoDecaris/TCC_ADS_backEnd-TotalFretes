import express from 'express';
import { createCargoType, getAllCargoTypes, getCargoTypeById, updateCargoType, deleteCargoType } from '../controllers/cargoTypes.controller';
import { authMiddleware, authorizeRoles } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, authorizeRoles('COMPANY'), createCargoType);
router.get('/', authMiddleware, getAllCargoTypes);
router.get('/:id', authMiddleware, getCargoTypeById);
router.put('/:id', authMiddleware, authorizeRoles('COMPANY'), updateCargoType);
router.delete('/:id', authMiddleware, authorizeRoles('COMPANY'), deleteCargoType);

export default router;
