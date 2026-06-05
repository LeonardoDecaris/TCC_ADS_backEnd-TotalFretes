import { STORED_IMAGE_KINDS } from '../config/storedImageKinds';
import CargoImage from '../models/cargoImage.model';
import CompanyImage from '../models/companyImage.model';
import VehicleImage from '../models/vehicleImage.model';
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
export const vehicleImagesUpload = createStoredImageUpload(STORED_IMAGE_KINDS.vehicle.uploadSubdir);
export const companyImagesUpload = createStoredImageUpload(STORED_IMAGE_KINDS.company.uploadSubdir);

export const cargoImagesRoutes = createStoredImageRoutes(
  STORED_IMAGE_KINDS.cargo,
  CargoImage,
  cargoImagesUpload,
);

export const vehicleImagesRoutes = createStoredImageRoutes(
  STORED_IMAGE_KINDS.vehicle,
  VehicleImage,
  vehicleImagesUpload,
);

export const companyImagesRoutes = createStoredImageRoutes(
  STORED_IMAGE_KINDS.company,
  CompanyImage,
  companyImagesUpload,
  (body) => {
    const companyId = parseId(body.companyId);
    return companyId === null ? null : { companyId };
  },
);

export { handleStoredImageUploadError };
