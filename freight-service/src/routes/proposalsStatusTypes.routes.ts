import express from 'express';
import { createProposalStatusType, deleteProposalStatusType, getAllProposalStatusTypes, getProposalStatusTypeById, updateProposalStatusType } from '../controllers/proposalsStatusTypes.controller';
import { authMiddleware, authorizeRoles } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, authorizeRoles('ADMIN'), createProposalStatusType);
router.get('/', authMiddleware, getAllProposalStatusTypes);
router.get('/:id', authMiddleware, getProposalStatusTypeById);
router.put('/:id', authMiddleware, authorizeRoles('ADMIN'), updateProposalStatusType);
router.delete('/:id', authMiddleware, authorizeRoles('ADMIN'), deleteProposalStatusType);

export default router;
