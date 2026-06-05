import fs from 'fs';
import { Request, Response, Router } from 'express';
import type { Model, ModelStatic } from 'sequelize';

import type { StoredImageKindConfig } from '../config/storedImageKinds';
import { logger } from '../config/logger';
import {
  getStoredImageJsonByPk,
  serializeStoredImage,
  type StoredImageControllerDeps,
} from '../services/storedImage.service';
import { sendStorageError } from '../utils/httpResponse';
import { translation } from '../utils/i18n';
import { getLocaleFromRequest } from '../utils/locale';
import type { StoredImageUploadHelpers } from '../utils/storedImageUpload';
import { logError } from '@total-fretes/observability';

type RequestWithFile = Request & {
  file?: { originalname: string; filename: string; mimetype: string; size: number };
  body: Record<string, unknown>;
};

const parseId = (value: unknown): number | null => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
};

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

      const extraPayload = resolveCreatePayload
        ? await resolveCreatePayload(req.body)
        : {};

      if (extraPayload === null) {
        return res.status(400).json({
          message: await translation('USER_IMAGE.INVALID_OWNER', locale),
        });
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

      return res.status(201).json({
        message: await translation('USER_IMAGE.SAVED_SUCCESSFULLY', locale),
        [config.responseKey]: serializeStoredImage(config, savedImage as Model),
      });
    } catch (error) {
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

      const oldFileName = String((image.toJSON() as Record<string, unknown>).fileName ?? '');
      const oldFullPath = upload.getStoredFullPath(oldFileName);
      if (oldFileName && fs.existsSync(oldFullPath)) {
        fs.unlinkSync(oldFullPath);
      }
      upload.removeFromBackup(oldFileName);

      await image.update({
        originalName: req.file.originalname,
        fileName: req.file.filename,
        path: upload.getStoredRelativePath(req.file.filename),
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size,
      });

      upload.copyToBackup(req.file.filename);

      const updated = await Model.findByPk(id);
      return res.status(200).json({
        message: await translation('USER_IMAGE.UPDATED_SUCCESSFULLY', locale),
        [config.responseKey]: updated ? serializeStoredImage(config, updated as Model) : null,
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
      if (oldFileName && fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
      upload.removeFromBackup(oldFileName);
      await image.destroy();

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

  router.post('/upload', upload.upload.single('image'), controller.saveImage);
  router.get('/', controller.getAllImages);
  router.get('/:id', controller.getImageById);
  router.put('/:id', upload.upload.single('image'), controller.updateImage);
  router.delete('/:id', controller.deleteImage);

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
