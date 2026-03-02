import express from 'express';
import { handleUploadError, saveUserImage } from '../controllers/userImages.controller';
import { uploadUserImage } from '../utils/upload';

const router = express.Router();

router.post('/upload', uploadUserImage.single('image'), saveUserImage);
router.use(handleUploadError);

export default router;
