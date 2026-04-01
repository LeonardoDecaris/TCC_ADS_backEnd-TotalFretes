import express from 'express';
import { createCompanyAddress, getAllCompanyAddresses, getCompanyAddressById, updateCompanyAddress, deleteCompanyAddress } from '../controllers/address.controller';
import { authMiddleware, authorizeRoles } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, authorizeRoles('COMPANY'), createCompanyAddress);
router.get('/', authMiddleware, authorizeRoles('COMPANY', 'ADMIN'), getAllCompanyAddresses);
router.get('/:id', authMiddleware, authorizeRoles('COMPANY', 'ADMIN'), getCompanyAddressById);
router.put('/:id', authMiddleware, authorizeRoles('COMPANY', 'ADMIN'), updateCompanyAddress);
router.delete('/:id', authMiddleware, authorizeRoles('COMPANY', 'ADMIN'), deleteCompanyAddress);

export default router;