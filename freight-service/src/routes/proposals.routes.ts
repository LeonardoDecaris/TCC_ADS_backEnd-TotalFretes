import express from 'express';
import { acceptProposal, createProposal, deleteProposal, getAllProposals, getProposalById, updateProposal } from '../controllers/proposals.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, createProposal);
router.get('/', authMiddleware, getAllProposals);
router.get('/:id', authMiddleware, getProposalById);
router.put('/:id', authMiddleware, updateProposal);
router.delete('/:id', authMiddleware, deleteProposal);
router.patch('/:id/accept', authMiddleware, acceptProposal);

export default router;
