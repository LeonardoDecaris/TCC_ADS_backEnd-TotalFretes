import express from 'express';
import { acceptProposal, createProposal, deleteProposal, getAllProposals, getProposalById, updateProposal } from '../controllers/proposals.controller';
import { authMiddleware, authorizeRoles } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, authorizeRoles('USER'), createProposal);
router.get('/', authMiddleware, getAllProposals);
router.get('/:id', authMiddleware, getProposalById);
router.put('/:id', authMiddleware, authorizeRoles('USER'), updateProposal);
router.delete('/:id', authMiddleware, authorizeRoles('USER'), deleteProposal);
router.patch('/:id/accept', authMiddleware, authorizeRoles('COMPANY'), acceptProposal);

export default router;
