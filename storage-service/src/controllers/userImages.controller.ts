import fs from 'fs';
import { Request, Response } from 'express';
import UserImage from '../models/userImages.model';
import { STORED_IMAGE_KINDS } from '../config/storedImageKinds';
import { getUserImageJsonByPk, serializeUserImage } from '../services/userImage.service';
import { sendStorageError } from '../utils/httpResponse';
import { translation } from '../utils/i18n';
import { getLocaleFromRequest } from '../utils/locale';
import { createStoredImageUpload } from '../utils/storedImageUpload';
import { isValidImageSignature, readFileHeader } from '../utils/imageSignature';
import {
  buildIdempotencyFingerprint,
  getIdempotencyReplay,
  normalizeIdempotencyKey,
  storeIdempotencyResponse,
} from '../services/imageIdempotency.service';
import { enqueueImageEvent } from '../services/imageOutbox.service';
import { logError } from '@total-fretes/logging';
import { logger } from '../config/logging';

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

async function validateUploadedImageSignature(
  fullPath: string,
  locale: string,
  res: Response,
): Promise<boolean> {
  try {
    const header = readFileHeader(fullPath);
    if (isValidImageSignature(header)) return true;

    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    await sendStorageError(res, 400, await translation('USER_IMAGE.INVALID_FILE_SIGNATURE', locale));
    return false;
  } catch (error) {
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    await sendStorageError(res, 400, await translation('USER_IMAGE.INVALID_FILE_SIGNATURE', locale), error);
    return false;
  }
}

export const uploadUserImage = userImagesUpload.upload;

export const saveUserImage = async (req: RequestWithFile, res: Response) => {
  const locale = getLocaleFromRequest(req);
  try {
    logger.info('user-images upload request received', {
      userId: req.user?.id,
      role: req.user?.role,
      hasFile: Boolean(req.file),
      ownerIdBody: req.body?.ownerId,
      contentType: req.headers['content-type'],
      xRequestId: req.headers['x-request-id'],
    });

    if (!req.file) {
      logger.warn('user-images upload rejected: no file in multipart body', {
        userId: req.user?.id,
        contentType: req.headers['content-type'],
      });
      return res.status(400).json({
        message: await translation('USER_IMAGE.NO_IMAGE_SENT', locale),
      });
    }
    const newFilePath = userImagesUpload.getStoredFullPath(req.file.filename);
    const isValidSignature = await validateUploadedImageSignature(newFilePath, locale, res);
    if (!isValidSignature) return;

    const user = req.user;
    const ownerType = 'USER';
    const ownerId = user?.role === 'ADMIN'
      ? parseId(req.body.ownerId)
      : user?.role === 'USER'
        ? Number(user.id)
        : null;

    if (ownerId === null) {
      return res.status(400).json({
        message: await translation('USER_IMAGE.INVALID_OWNER', locale),
      });
    }

    const idempotencyKey = normalizeIdempotencyKey(req.headers['idempotency-key']);
    const idempotencyScope = 'user-images:upload';
    const idempotencyFingerprint = buildIdempotencyFingerprint({
      ownerId,
      ownerType,
      fileName: req.file.filename,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
    });
    if (idempotencyKey && user) {
      const replay = await getIdempotencyReplay({
        key: idempotencyKey,
        scope: idempotencyScope,
        userId: Number(user.id),
        fingerprint: idempotencyFingerprint,
      });
      if (replay) {
        if (fs.existsSync(newFilePath)) fs.unlinkSync(newFilePath);
        return res.status(replay.statusCode).json(replay.responseBody);
      }
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

    const responseBody = {
      message: await translation('USER_IMAGE.SAVED_SUCCESSFULLY', locale),
      userImage: serializeUserImage(savedImage),
    };

    if (idempotencyKey && user) {
      await storeIdempotencyResponse({
        key: idempotencyKey,
        scope: idempotencyScope,
        userId: Number(user.id),
        fingerprint: idempotencyFingerprint,
        statusCode: 201,
        responseBody,
      });
    }

    await enqueueImageEvent({
      eventType: 'ImageCreated',
      imageKind: STORED_IMAGE_KINDS.user.kind,
      imageId: savedImage.id ? Number(savedImage.id) : undefined,
      payload: {
        ownerType,
        ownerId,
        fileName: req.file.filename,
      },
    });

    return res.status(201).json(responseBody);
  } catch (error) {
    if (error instanceof Error && error.message === 'IDEMPOTENCY_FINGERPRINT_MISMATCH') {
      return sendStorageError(
        res,
        409,
        await translation('USER_IMAGE.IDEMPOTENCY_CONFLICT', locale),
      );
    }
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
    if (error instanceof Error && error.message === 'IDEMPOTENCY_FINGERPRINT_MISMATCH') {
      return sendStorageError(
        res,
        409,
        await translation('USER_IMAGE.IDEMPOTENCY_CONFLICT', locale),
      );
    }
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

    const newFilePath = userImagesUpload.getStoredFullPath(req.file.filename);
    const isValidSignature = await validateUploadedImageSignature(newFilePath, locale, res);
    if (!isValidSignature) return;

    const oldFileName = userImage.fileName ?? '';
    const oldFullPath = userImagesUpload.getStoredFullPath(oldFileName);
    const user = req.user;
    const idempotencyKey = normalizeIdempotencyKey(req.headers['idempotency-key']);
    const idempotencyScope = `user-images:update:${id}`;
    const idempotencyFingerprint = buildIdempotencyFingerprint({
      id,
      fileName: req.file.filename,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
    });
    if (idempotencyKey && user) {
      const replay = await getIdempotencyReplay({
        key: idempotencyKey,
        scope: idempotencyScope,
        userId: Number(user.id),
        fingerprint: idempotencyFingerprint,
      });
      if (replay) {
        if (fs.existsSync(newFilePath)) fs.unlinkSync(newFilePath);
        return res.status(replay.statusCode).json(replay.responseBody);
      }
    }

    try {
      await userImage.update({
        originalName: req.file.originalname,
        fileName: req.file.filename,
        path: userImagesUpload.getStoredRelativePath(req.file.filename),
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size,
      });
    } catch (error) {
      if (fs.existsSync(newFilePath)) fs.unlinkSync(newFilePath);
      throw error;
    }

    if (oldFileName && fs.existsSync(oldFullPath)) {
      fs.unlinkSync(oldFullPath);
    }
    userImagesUpload.removeFromBackup(oldFileName);

    userImagesUpload.copyToBackup(req.file.filename);

    const updated = await UserImage.findByPk(id);
    const responseBody = {
      message: await translation('USER_IMAGE.UPDATED_SUCCESSFULLY', locale),
      userImage: updated ? serializeUserImage(updated) : null,
    };

    if (idempotencyKey && user) {
      await storeIdempotencyResponse({
        key: idempotencyKey,
        scope: idempotencyScope,
        userId: Number(user.id),
        fingerprint: idempotencyFingerprint,
        statusCode: 200,
        responseBody,
      });
    }

    await enqueueImageEvent({
      eventType: 'ImageUpdated',
      imageKind: STORED_IMAGE_KINDS.user.kind,
      imageId: id,
      payload: {
        fileName: req.file.filename,
      },
    });

    return res.status(200).json(responseBody);
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
    await userImage.destroy();
    const oldFileName = userImage.fileName ?? '';
    const fullPath = userImagesUpload.getStoredFullPath(oldFileName);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
    userImagesUpload.removeFromBackup(oldFileName);

    await enqueueImageEvent({
      eventType: 'ImageDeleted',
      imageKind: STORED_IMAGE_KINDS.user.kind,
      imageId: id,
      payload: {
        fileName: oldFileName,
      },
    });
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
