import express from 'express';
import {
	createCompany,
	createCompanyEndAccount,
	getCompanyById,
	getAllCompanies,
	updateCompany,
	deleteCompany,
} from '../controllers/company.controller';
import { allowOwnerOrRoles, authMiddleware, authorizeRoles } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/end-account', createCompanyEndAccount);
router.post('/', createCompany);
router.get('/:id', authMiddleware, allowOwnerOrRoles(), getCompanyById); 
router.get('/', authMiddleware, authorizeRoles('ADMIN'), getAllCompanies);
router.put('/:id', authMiddleware, allowOwnerOrRoles(), updateCompany);
router.delete('/:id', authMiddleware, allowOwnerOrRoles(), deleteCompany);

export default router;