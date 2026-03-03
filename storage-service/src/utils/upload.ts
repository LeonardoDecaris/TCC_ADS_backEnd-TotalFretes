import fs from 'fs';
import multer from 'multer';
import path from 'path';

const rootDir = process.cwd();
const uploadDir = process.env.UPLOAD_DIR || path.join(rootDir, 'uploads', 'user-images');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension).replace(/\s+/g, '-');
    const fileName = `${Date.now()}-${baseName}${extension}`;
    cb(null, fileName);
  },
});

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const uploadUserImage = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (!imageMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Arquivo inválido. Envie apenas imagens.'));
    }
    cb(null, true);
  },
});

export const getStoredRelativePath = (fileName: string) => path.join('uploads', 'user-images', fileName);
