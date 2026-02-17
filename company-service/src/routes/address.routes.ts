import express from 'express';
import { createCompanyAddress, getAllCompanyAddresses, getCompanyAddressById, updateCompanyAddress, deleteCompanyAddress } from '../controllers/address.controller';

const router = express.Router();

router.post('/', createCompanyAddress);
router.get('/', getAllCompanyAddresses);
router.get('/:id', getCompanyAddressById);
router.put('/:id', updateCompanyAddress);
router.delete('/:id', deleteCompanyAddress);

export default router;