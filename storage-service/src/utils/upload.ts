import fs from 'fs';
import multer from 'multer';
import path from 'path';

const rootDir = process.cwd();
// Garante um diretório padrão mesmo se UPLOAD_DIR não estiver definido
const uploadDir: string =
  process.env.UPLOAD_DIR || path.join(rootDir, 'uploads', 'user-images');

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

/** Retorna o caminho absoluto do arquivo no disco (para leitura/remoção). */
export const getStoredFullPath = (fileName: string) => path.join(uploadDir, fileName);

/** Diretório onde as imagens são salvas (para servir arquivos estáticos). */
export const uploadDirPath = uploadDir;

/** Cópia de backup na pasta local (host). Se BACKUP_UPLOAD_DIR não estiver definido, não faz nada. */
const backupDir: string | null =
  process.env.BACKUP_UPLOAD_DIR != null && String(process.env.BACKUP_UPLOAD_DIR).trim() !== ''
    ? String(process.env.BACKUP_UPLOAD_DIR).trim()
    : null;

if (backupDir != null && !fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

/**
 * Copia o arquivo salvo para o diretório de backup (pasta local montada no host).
 * Chamado após cada upload para não perder imagens ao recriar o container.
 */
export const copyToBackup = (sourceFullPath: string, fileName: string): void => {
  if (backupDir == null) return;
  try {
    const dest = path.join(backupDir, fileName);
    fs.copyFileSync(sourceFullPath, dest);
  } catch {
    // Falha silenciosa para não quebrar o upload; o arquivo já está em uploadDir
  }
};

/**
 * Remove o arquivo do diretório de backup (ex.: ao substituir ou deletar imagem).
 */
export const removeFromBackup = (fileName: string): void => {
  if (backupDir == null) return;
  try {
    const dest = path.join(backupDir, fileName);
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
  } catch {
    // Falha silenciosa
  }
};
