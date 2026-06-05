import fs from 'fs';
import multer from 'multer';
import path from 'path';

const rootDir = process.cwd();
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const backupDir: string | null =
  process.env.BACKUP_UPLOAD_DIR != null && String(process.env.BACKUP_UPLOAD_DIR).trim() !== ''
    ? String(process.env.BACKUP_UPLOAD_DIR).trim()
    : null;

if (backupDir != null && !fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

export type StoredImageUploadHelpers = {
  upload: multer.Multer;
  uploadDirPath: string;
  getStoredRelativePath: (fileName: string) => string;
  getStoredFullPath: (fileName: string) => string;
  copyToBackup: (fileName: string) => void;
  removeFromBackup: (fileName: string) => void;
};

export function createStoredImageUpload(uploadSubdir: string): StoredImageUploadHelpers {
  const uploadDir =
    process.env.UPLOAD_DIR && uploadSubdir === 'user-images'
      ? process.env.UPLOAD_DIR
      : path.join(rootDir, 'uploads', uploadSubdir);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const backupSubdir = path.join(backupDir ?? '', uploadSubdir);

  if (backupDir != null && !fs.existsSync(backupSubdir)) {
    fs.mkdirSync(backupSubdir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      const extension = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, extension).replace(/\s+/g, '-');
      cb(null, `${Date.now()}-${baseName}${extension}`);
    },
  });

  const upload = multer({
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

  const getStoredRelativePath = (fileName: string) =>
    path.join('uploads', uploadSubdir, fileName);

  const getStoredFullPath = (fileName: string) => path.join(uploadDir, fileName);

  const copyToBackup = (fileName: string): void => {
    if (backupDir == null) return;
    try {
      const dest = path.join(backupSubdir, fileName);
      fs.copyFileSync(getStoredFullPath(fileName), dest);
    } catch {
      // backup opcional
    }
  };

  const removeFromBackup = (fileName: string): void => {
    if (backupDir == null) return;
    try {
      const dest = path.join(backupSubdir, fileName);
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
    } catch {
      // backup opcional
    }
  };

  return {
    upload,
    uploadDirPath: uploadDir,
    getStoredRelativePath,
    getStoredFullPath,
    copyToBackup,
    removeFromBackup,
  };
}
