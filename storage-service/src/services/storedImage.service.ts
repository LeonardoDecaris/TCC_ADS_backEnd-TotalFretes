import type { Model, ModelStatic } from 'sequelize';

import type { StoredImageKindConfig } from '../config/storedImageKinds';
import type { StoredImageUploadHelpers } from '../utils/storedImageUpload';

export function serializeStoredImage(
  config: Pick<StoredImageKindConfig, 'uploadSubdir'>,
  row: Model,
): Record<string, unknown> {
  const json = row.toJSON() as Record<string, unknown>;
  const fileName = typeof json.fileName === 'string' ? json.fileName : '';

  return {
    ...json,
    url: fileName ? `/api/uploads/${config.uploadSubdir}/${fileName}` : null,
  };
}

export async function getStoredImageJsonByPk(
  Model: ModelStatic<Model>,
  config: Pick<StoredImageKindConfig, 'uploadSubdir'>,
  id: number,
): Promise<Record<string, unknown> | null> {
  const row = await Model.findByPk(id);
  return row ? serializeStoredImage(config, row) : null;
}

export type StoredImageControllerDeps = {
  Model: ModelStatic<Model>;
  config: StoredImageKindConfig;
  upload: StoredImageUploadHelpers;
  resolveCreatePayload?: (
    body: Record<string, unknown>,
  ) => Promise<Record<string, unknown> | null> | Record<string, unknown> | null;
};
