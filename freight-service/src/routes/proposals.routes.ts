import express from 'express';
import {
	acceptProposal,
	confirmProposalByDriver,
	createProposal,
	declineProposalByDriver,
	deleteProposal,
	getAllProposals,
	getProposalById,
	getProposalFreightSummary,
	rejectProposal,
	updateProposal,
} from '../controllers/proposals.controller';
import { authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, authorizeRoles('USER'), createProposal);
router.get('/', authMiddleware, getAllProposals);
router.get('/freight-summary',	authMiddleware, authorizeRoles('COMPANY', 'ADMIN'), getProposalFreightSummary);
router.get('/:id', authMiddleware, getProposalById);
router.put('/:id', authMiddleware, authorizeRoles('USER'), updateProposal);
router.delete('/:id', authMiddleware, authorizeRoles('USER'), deleteProposal);
router.patch('/:id/accept', authMiddleware, authorizeRoles('COMPANY'), acceptProposal);
router.patch('/:id/confirm-driver', authMiddleware, authorizeRoles('USER'), confirmProposalByDriver);
router.patch('/:id/decline-driver', authMiddleware, authorizeRoles('USER'), declineProposalByDriver);
router.patch('/:id/reject', authMiddleware, authorizeRoles('COMPANY'), rejectProposal);

export default router;
