import express from 'express';
import { authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';
import {
  deleteUserImage,
  getAllUserImages,
  getUserImageById,
  handleUploadError,
  saveUserImage,
  updateUserImage,
  uploadUserImage,
} from '../controllers/userImages.controller';

const router = express.Router();

router.post('/upload', authMiddleware, authorizeRoles('USER', 'ADMIN'), uploadUserImage.single('image'), saveUserImage);
router.get('/', authMiddleware, authorizeRoles('ADMIN'), getAllUserImages);
router.get('/:id', getUserImageById);
router.put('/:id', authMiddleware, authorizeRoles('USER', 'ADMIN'), uploadUserImage.single('image'), updateUserImage);
router.delete('/:id', authMiddleware, authorizeRoles('USER', 'ADMIN'), deleteUserImage);
router.use(handleUploadError);

export default router;
