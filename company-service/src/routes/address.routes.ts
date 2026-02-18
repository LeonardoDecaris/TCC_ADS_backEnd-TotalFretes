import express from 'express';
import { createCompanyAddress, getAllCompanyAddresses, getCompanyAddressById, updateCompanyAddress, deleteCompanyAddress } from '../controllers/address.controller';
import { authMiddleware, authorizeRoles } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, authorizeRoles('empresa'), createCompanyAddress);
router.get('/', authMiddleware, authorizeRoles('empresa', 'admin'), getAllCompanyAddresses);
router.get('/:id', authMiddleware, authorizeRoles('empresa', 'admin'), getCompanyAddressById);
router.put('/:id', authMiddleware, authorizeRoles('empresa', 'admin'), updateCompanyAddress);
router.delete('/:id', authMiddleware, authorizeRoles('empresa', 'admin'), deleteCompanyAddress);

export default router;