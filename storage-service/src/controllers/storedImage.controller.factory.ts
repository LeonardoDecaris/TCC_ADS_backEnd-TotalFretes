import fs from 'fs';
import { Request, Response, Router } from 'express';
import type { Model, ModelStatic } from 'sequelize';

import type { StoredImageKindConfig } from '../config/storedImageKinds';
import { logger } from '../config/logging';
import {
  getStoredImageJsonByPk,
  serializeStoredImage,
  type StoredImageControllerDeps,
} from '../services/storedImage.service';
import { authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';
import { sendStorageError } from '../utils/httpResponse';
import { translation } from '../utils/i18n';
import { getLocaleFromRequest } from '../utils/locale';
import type { StoredImageUploadHelpers } from '../utils/storedImageUpload';
import { isValidImageSignature, readFileHeader } from '../utils/imageSignature';
import {
  buildIdempotencyFingerprint,
  getIdempotencyReplay,
  normalizeIdempotencyKey,
  storeIdempotencyResponse,
} from '../services/imageIdempotency.service';
import { enqueueImageEvent } from '../services/imageOutbox.service';
import { logError } from '@total-fretes/logging';

type RequestWithFile = Request & {
  file?: { originalname: string; filename: string; mimetype: string; size: number };
  body: Record<string, unknown>;
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

export function createStoredImageController(deps: StoredImageControllerDeps) {
  const { Model, config, upload, resolveCreatePayload } = deps;

  const saveImage = async (req: RequestWithFile, res: Response) => {
    const locale = getLocaleFromRequest(req);
    try {
      if (!req.file) {
        return res.status(400).json({
          message: await translation('USER_IMAGE.NO_IMAGE_SENT', locale),
        });
      }
      const newFilePath = upload.getStoredFullPath(req.file.filename);
      const isValidSignature = await validateUploadedImageSignature(newFilePath, locale, res);
      if (!isValidSignature) return;

      const extraPayload = resolveCreatePayload
        ? await resolveCreatePayload(req)
        : {};

      if (extraPayload === null) {
        return res.status(400).json({
          message: await translation('USER_IMAGE.INVALID_OWNER', locale),
        });
      }

      const user = req.user;
      const idempotencyKey = normalizeIdempotencyKey(req.headers['idempotency-key']);
      const idempotencyScope = `${config.routeBase}:upload`;
      const idempotencyFingerprint = buildIdempotencyFingerprint({
        extraPayload,
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

      const savedImage = await Model.create({
        originalName: req.file.originalname,
        fileName: req.file.filename,
        path: upload.getStoredRelativePath(req.file.filename),
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size,
        ...extraPayload,
      });

      upload.copyToBackup(req.file.filename);

      const responseBody = {
        message: await translation('USER_IMAGE.SAVED_SUCCESSFULLY', locale),
        [config.responseKey]: serializeStoredImage(config, savedImage as Model),
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
        imageKind: config.kind,
        imageId: (savedImage.toJSON() as { id?: number }).id,
        payload: {
          ...extraPayload,
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
      logError(logger, `save ${config.routeBase} failed`, error);
      return sendStorageError(
        res,
        500,
        await translation('USER_IMAGE.SAVE_FAILED', locale),
        error,
      );
    }
  };

  const getAllImages = async (_req: Request, res: Response) => {
    const locale = getLocaleFromRequest(_req);
    try {
      const images = await Model.findAll({ order: [['id', 'ASC']] });
      return res.status(200).json(
        images.map((image) => serializeStoredImage(config, image as Model)),
      );
    } catch (error) {
      return sendStorageError(
        res,
        500,
        await translation('USER_IMAGE.GET_ALL_FAILED', locale),
        error,
      );
    }
  };

  const getImageById = async (req: Request, res: Response) => {
    const locale = getLocaleFromRequest(req);
    try {
      const id = parseId(req.params.id);
      if (id === null) {
        return res.status(400).json({
          message: await translation('USER_IMAGE.INVALID_ID', locale),
        });
      }

      const image = await getStoredImageJsonByPk(Model, config, id);
      if (!image) {
        return res.status(404).json({
          message: await translation('USER_IMAGE.NOT_FOUND', locale),
        });
      }

      return res.status(200).json(image);
    } catch (error) {
      return sendStorageError(
        res,
        500,
        await translation('USER_IMAGE.GET_BY_ID_FAILED', locale),
        error,
      );
    }
  };

  const updateImage = async (req: RequestWithFile, res: Response) => {
    const locale = getLocaleFromRequest(req);
    try {
      const id = parseId(req.params.id);
      if (id === null) {
        return res.status(400).json({
          message: await translation('USER_IMAGE.INVALID_ID', locale),
        });
      }

      const image = await Model.findByPk(id);
      if (!image) {
        return res.status(404).json({
          message: await translation('USER_IMAGE.NOT_FOUND', locale),
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: await translation('USER_IMAGE.NO_IMAGE_SENT', locale),
        });
      }

      const newFilePath = upload.getStoredFullPath(req.file.filename);
      const isValidSignature = await validateUploadedImageSignature(newFilePath, locale, res);
      if (!isValidSignature) return;

      const oldFileName = String((image.toJSON() as Record<string, unknown>).fileName ?? '');
      const oldFullPath = upload.getStoredFullPath(oldFileName);
      const user = req.user;
      const idempotencyKey = normalizeIdempotencyKey(req.headers['idempotency-key']);
      const idempotencyScope = `${config.routeBase}:update:${id}`;
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
        await image.update({
          originalName: req.file.originalname,
          fileName: req.file.filename,
          path: upload.getStoredRelativePath(req.file.filename),
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
      upload.removeFromBackup(oldFileName);

      upload.copyToBackup(req.file.filename);

      const updated = await Model.findByPk(id);
      const responseBody = {
        message: await translation('USER_IMAGE.UPDATED_SUCCESSFULLY', locale),
        [config.responseKey]: updated ? serializeStoredImage(config, updated as Model) : null,
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
        imageKind: config.kind,
        imageId: id,
        payload: {
          fileName: req.file.filename,
        },
      });

      return res.status(200).json(responseBody);
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
        await translation('USER_IMAGE.UPDATE_FAILED', locale),
        error,
      );
    }
  };

  const deleteImage = async (req: Request, res: Response) => {
    const locale = getLocaleFromRequest(req);
    try {
      const id = parseId(req.params.id);
      if (id === null) {
        return res.status(400).json({
          message: await translation('USER_IMAGE.INVALID_ID', locale),
        });
      }

      const image = await Model.findByPk(id);
      if (!image) {
        return res.status(404).json({
          message: await translation('USER_IMAGE.NOT_FOUND', locale),
        });
      }

      const oldFileName = String((image.toJSON() as Record<string, unknown>).fileName ?? '');
      const fullPath = upload.getStoredFullPath(oldFileName);
      await image.destroy();
      if (oldFileName && fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
      upload.removeFromBackup(oldFileName);
      await enqueueImageEvent({
        eventType: 'ImageDeleted',
        imageKind: config.kind,
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

  return {
    saveImage,
    getAllImages,
    getImageById,
    updateImage,
    deleteImage,
  };
}

export function createStoredImageRoutes(
  config: StoredImageKindConfig,
  Model: ModelStatic<Model>,
  upload: StoredImageUploadHelpers,
  resolveCreatePayload?: StoredImageControllerDeps['resolveCreatePayload'],
) {
  const controller = createStoredImageController({
    Model,
    config,
    upload,
    resolveCreatePayload,
  });

  const router = Router();
  const mutableRoles = config.kind === 'cargo'
    ? (['ADMIN'] as const)
    : (['COMPANY', 'ADMIN'] as const);

  router.post('/upload', authMiddleware, authorizeRoles(...mutableRoles), upload.upload.single('image'), controller.saveImage);
  router.get('/', authMiddleware, authorizeRoles('ADMIN'), controller.getAllImages);
  router.get('/:id', controller.getImageById);
  router.put('/:id', authMiddleware, authorizeRoles(...mutableRoles), upload.upload.single('image'), controller.updateImage);
  router.delete('/:id', authMiddleware, authorizeRoles(...mutableRoles), controller.deleteImage);

  return router;
}

export const handleStoredImageUploadError = async (
  err: Error,
  req: Request,
  res: Response,
  _next: (err?: unknown) => void,
) => {
  const locale = getLocaleFromRequest(req);
  logError(logger, 'handleStoredImageUploadError', err);

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
