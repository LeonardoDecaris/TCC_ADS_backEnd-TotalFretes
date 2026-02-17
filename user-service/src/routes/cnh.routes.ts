import express from 'express';
import { createCnhType, getAllCnhTypes, getCnhTypeById, updateCnhType, deleteCnhType } from '../controllers/cnh.controller';

const router = express.Router();

router.post('/', createCnhType);
router.get('/', getAllCnhTypes);
router.get('/:id', getCnhTypeById);
router.put('/:id', updateCnhType);
router.delete('/:id', deleteCnhType);

export default router;