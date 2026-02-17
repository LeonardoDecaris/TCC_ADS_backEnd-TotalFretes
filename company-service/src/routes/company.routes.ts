import express from 'express';
import { createCompany, getCompanyById, getAllCompanies, updateCompany, deleteCompany } from '../controllers/company.controller';

const router = express.Router();

router.post('/', createCompany);
router.get('/:id', getCompanyById); 
router.get('/', getAllCompanies);
router.put('/:id', updateCompany);
router.delete('/:id', deleteCompany);

export default router;