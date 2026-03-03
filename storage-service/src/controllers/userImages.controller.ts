import { Request, Response } from 'express';
import UserImage from '../models/userImages.model';
import { getStoredRelativePath } from '../utils/upload';

export const saveUserImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhuma imagem foi enviada.' });
    }

    const savedImage = await UserImage.create({
      originalName: req.file.originalname,
      fileName: req.file.filename,
      path: getStoredRelativePath(req.file.filename),
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
    });

    return res.status(201).json({
      message: 'Imagem salva com sucesso.',
      userImage: savedImage,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao salvar imagem.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const handleUploadError = (
  err: Error,
  _req: Request,
  res: Response,
  _next: (_error?: unknown) => void
) => {
  if (err.message.includes('Arquivo inválido')) {
    return res.status(400).json({ message: err.message });
  }

  if (err.message.toLowerCase().includes('file too large')) {
    return res.status(400).json({ message: 'Arquivo excede o limite de 5MB.' });
  }

  return res.status(500).json({ message: 'Erro ao processar upload.', error: err.message });
};
