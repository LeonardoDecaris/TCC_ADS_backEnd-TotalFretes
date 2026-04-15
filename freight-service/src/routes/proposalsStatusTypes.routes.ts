import express from 'express';
import { createProposalStatusType, deleteProposalStatusType, getAllProposalStatusTypes, getProposalStatusTypeById, updateProposalStatusType } from '../controllers/proposalsStatusTypes.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, createProposalStatusType);
router.get('/', authMiddleware, getAllProposalStatusTypes);
router.get('/:id', authMiddleware, getProposalStatusTypeById);
router.put('/:id', authMiddleware, updateProposalStatusType);
router.delete('/:id', authMiddleware, deleteProposalStatusType);

export default router;
