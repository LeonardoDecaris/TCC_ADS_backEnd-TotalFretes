import fs from 'fs';
import { Request, Response } from 'express';
import UserImage from '../models/userImages.model';
import { STORED_IMAGE_KINDS } from '../config/storedImageKinds';
import { getUserImageJsonByPk, serializeUserImage } from '../services/userImage.service';
import { sendStorageError } from '../utils/httpResponse';
import { translation } from '../utils/i18n';
import { getLocaleFromRequest } from '../utils/locale';
import { createStoredImageUpload } from '../utils/storedImageUpload';
import { logError } from '@total-fretes/observability';
import { logger } from '../config/logger';

const userImagesUpload = createStoredImageUpload(STORED_IMAGE_KINDS.user.uploadSubdir);

type RequestWithFile = Request & {
  file?: { originalname: string; filename: string; mimetype: string; size: number };
  body: {
    ownerType?: unknown;
    ownerId?: unknown;
  };
};

const parseId = (value: unknown): number | null => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
};

export const uploadUserImage = userImagesUpload.upload;

export const saveUserImage = async (req: RequestWithFile, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    if (!req.file) {
      return res.status(400).json({
        message: await translation('USER_IMAGE.NO_IMAGE_SENT', locale),
      });
    }

    const ownerType = req.body.ownerType === 'USER' ? 'USER' : null;
    const ownerId = parseId(req.body.ownerId);

    if (ownerType !== 'USER' || ownerId === null) {
      return res.status(400).json({
        message: await translation('USER_IMAGE.INVALID_OWNER', locale),
      });
    }

    const savedImage = await UserImage.create({
      originalName: req.file.originalname,
      fileName: req.file.filename,
      path: userImagesUpload.getStoredRelativePath(req.file.filename),
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      ownerType,
      ownerId,
    });

    userImagesUpload.copyToBackup(req.file.filename);

    return res.status(201).json({
      message: await translation('USER_IMAGE.SAVED_SUCCESSFULLY', locale),
      userImage: serializeUserImage(savedImage),
    });
  } catch (error) {
    logError(logger, 'saveUserImage failed', error);
    return sendStorageError(
      res,
      500,
      await translation('USER_IMAGE.SAVE_FAILED', locale),
      error,
    );
  }
};

export const getAllUserImages = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const images = await UserImage.findAll({ order: [['id', 'ASC']] });
    return res.status(200).json(images.map((image) => serializeUserImage(image)));
  } catch (error) {
    return sendStorageError(
      res,
      500,
      await translation('USER_IMAGE.GET_ALL_FAILED', locale),
      error,
    );
  }
};

export const getUserImageById = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({
        message: await translation('USER_IMAGE.INVALID_ID', locale),
      });
    }
    const userImage = await getUserImageJsonByPk(id);
    if (!userImage) {
      return res.status(404).json({
        message: await translation('USER_IMAGE.NOT_FOUND', locale),
      });
    }
    return res.status(200).json(userImage);
  } catch (error) {
    return sendStorageError(
      res,
      500,
      await translation('USER_IMAGE.GET_BY_ID_FAILED', locale),
      error,
    );
  }
};

export const updateUserImage = async (req: RequestWithFile, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({
        message: await translation('USER_IMAGE.INVALID_ID', locale),
      });
    }
    const userImage = await UserImage.findByPk(id);
    if (!userImage) {
      return res.status(404).json({
        message: await translation('USER_IMAGE.NOT_FOUND', locale),
      });
    }
    if (!req.file) {
      return res.status(400).json({
        message: await translation('USER_IMAGE.NO_IMAGE_SENT', locale),
      });
    }

    const oldFileName = userImage.fileName ?? '';
    const oldFullPath = userImagesUpload.getStoredFullPath(oldFileName);
    if (fs.existsSync(oldFullPath)) {
      fs.unlinkSync(oldFullPath);
    }
    userImagesUpload.removeFromBackup(oldFileName);

    await userImage.update({
      originalName: req.file.originalname,
      fileName: req.file.filename,
      path: userImagesUpload.getStoredRelativePath(req.file.filename),
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
    });

    userImagesUpload.copyToBackup(req.file.filename);

    const updated = await UserImage.findByPk(id);
    return res.status(200).json({
      message: await translation('USER_IMAGE.UPDATED_SUCCESSFULLY', locale),
      userImage: updated ? serializeUserImage(updated) : null,
    });
  } catch (error) {
    return sendStorageError(
      res,
      500,
      await translation('USER_IMAGE.UPDATE_FAILED', locale),
      error,
    );
  }
};

export const deleteUserImage = async (req: Request, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({
        message: await translation('USER_IMAGE.INVALID_ID', locale),
      });
    }
    const userImage = await UserImage.findByPk(id);
    if (!userImage) {
      return res.status(404).json({
        message: await translation('USER_IMAGE.NOT_FOUND', locale),
      });
    }
    const oldFileName = userImage.fileName ?? '';
    const fullPath = userImagesUpload.getStoredFullPath(oldFileName);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
    userImagesUpload.removeFromBackup(oldFileName);
    await userImage.destroy();
    return res.status(200).json({
      message: await translation('USER_IMAGE.DELETED_SUCCESSFULLY', locale),
    });
  } catch (error) {
    return sendStorageError(
      res,
      500,
      await translation('USER_IMAGE.DELETE_FAILED', locale),
      error,
    );
  }
};

export const handleUploadError = async (
  err: Error,
  req: Request,
  res: Response,
  _next: (err?: unknown) => void,
) => {
  const locale = getLocaleFromRequest(req);
  logError(logger, 'handleUploadError', err);

  if (err.message.includes('Arquivo inválido')) {
    return sendStorageError(
      res,
      400,
      await translation('USER_IMAGE.INVALID_FILE', locale),
      err,
    );
  }

  if (err.message.toLowerCase().includes('file too large')) {
    return sendStorageError(
      res,
      400,
      await translation('USER_IMAGE.FILE_TOO_LARGE', locale),
      err,
    );
  }

  return sendStorageError(
    res,
    500,
    await translation('USER_IMAGE.UPLOAD_PROCESS_FAILED', locale),
    err,
  );
};
