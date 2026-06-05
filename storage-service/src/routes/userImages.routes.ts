import express from 'express';
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

router.post('/upload', uploadUserImage.single('image'), saveUserImage);
router.get('/', getAllUserImages);
router.get('/:id', getUserImageById);
router.put('/:id', uploadUserImage.single('image'), updateUserImage);
router.delete('/:id', deleteUserImage);
router.use(handleUploadError);

export default router;
