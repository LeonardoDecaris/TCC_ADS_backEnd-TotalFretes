import { STORED_IMAGE_KINDS } from '../config/storedImageKinds';
import CargoImage from '../models/cargoImage.model';
import CompanyImage from '../models/companyImage.model';
import {
  createStoredImageRoutes,
  handleStoredImageUploadError,
} from '../controllers/storedImage.controller.factory';
import { createStoredImageUpload } from '../utils/storedImageUpload';

const parseId = (value: unknown): number | null => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
};

export const cargoImagesUpload = createStoredImageUpload(STORED_IMAGE_KINDS.cargo.uploadSubdir);
export const companyImagesUpload = createStoredImageUpload(STORED_IMAGE_KINDS.company.uploadSubdir);

export const cargoImagesRoutes = createStoredImageRoutes(
  STORED_IMAGE_KINDS.cargo,
  CargoImage,
  cargoImagesUpload,
);

export const companyImagesRoutes = createStoredImageRoutes(
  STORED_IMAGE_KINDS.company,
  CompanyImage,
  companyImagesUpload,
  (req) => {
    const user = req.user;
    const companyId = user?.role === 'COMPANY'
      ? Number(user.id)
      : parseId((req.body as Record<string, unknown>).companyId);
    return companyId === null ? null : { companyId };
  },
);

export { handleStoredImageUploadError };
