export type StoredImageKind = 'user' | 'company' | 'cargo' | 'vehicle';

export type StoredImageKindConfig = {
  kind: StoredImageKind;
  tableName: string;
  routeBase: string;
  uploadSubdir: string;
  responseKey: string;
};

export const STORED_IMAGE_KINDS: Record<StoredImageKind, StoredImageKindConfig> = {
  user: {
    kind: 'user',
    tableName: 'USER_IMAGES',
    routeBase: 'user-images',
    uploadSubdir: 'user-images',
    responseKey: 'userImage',
  },
  company: {
    kind: 'company',
    tableName: 'COMPANY_IMAGES',
    routeBase: 'company-images',
    uploadSubdir: 'company-images',
    responseKey: 'companyImage',
  },
  cargo: {
    kind: 'cargo',
    tableName: 'CARGO_IMAGES',
    routeBase: 'cargo-images',
    uploadSubdir: 'cargo-images',
    responseKey: 'cargoImage',
  },
  vehicle: {
    kind: 'vehicle',
    tableName: 'VEHICLE_IMAGES',
    routeBase: 'vehicle-images',
    uploadSubdir: 'vehicle-images',
    responseKey: 'vehicleImage',
  },
};
