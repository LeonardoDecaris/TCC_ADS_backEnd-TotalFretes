import express from 'express';
import {
	createCompany,
	createCompanyEndAccount,
	deleteCompanyImage,
	deleteOwnCompany,
	getCompanyById,
	getAllCompanies,
	upsertCompanyImage,
	updateCompany,
	deleteCompany,
} from '../controllers/company.controller';
import { allowOwnerOrRoles, authMiddleware, authorizeRoles } from '../middleware/authMiddleware';
import { handleCompanyImageUploadError, uploadCompanyImage } from '../utils/uploadCompanyImage';

const router = express.Router();

router.post('/end-account', createCompanyEndAccount);
router.post('/', createCompany);
router.delete('/me', authMiddleware, authorizeRoles('COMPANY'), deleteOwnCompany);
router.get('/:id', authMiddleware, allowOwnerOrRoles(), getCompanyById); 
router.get('/', authMiddleware, authorizeRoles('ADMIN'), getAllCompanies);
router.post('/:id/image', authMiddleware, allowOwnerOrRoles(), uploadCompanyImage.single('image'), upsertCompanyImage);
router.delete('/:id/image', authMiddleware, allowOwnerOrRoles(), deleteCompanyImage);
router.put('/:id', authMiddleware, allowOwnerOrRoles(), updateCompany);
router.delete('/:id', authMiddleware, allowOwnerOrRoles(), deleteCompany);
router.use(handleCompanyImageUploadError);

export default router;