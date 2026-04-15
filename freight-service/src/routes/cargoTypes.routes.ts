import express from 'express';
import { createCargoType, getAllCargoTypes, getCargoTypeById, updateCargoType, deleteCargoType } from '../controllers/cargoTypes.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, createCargoType);
router.get('/', authMiddleware, getAllCargoTypes);
router.get('/:id', authMiddleware, getCargoTypeById);
router.put('/:id', authMiddleware, updateCargoType);
router.delete('/:id', authMiddleware, deleteCargoType);

export default router;
