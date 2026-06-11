import { STORED_IMAGE_KINDS } from '../config/storedImageKinds';
import UserImage from '../models/userImages.model';
import { serializeStoredImage } from '../services/storedImage.service';

export function serializeUserImage(row: UserImage): Record<string, unknown> {
  return serializeStoredImage(STORED_IMAGE_KINDS.user, row);
}

export async function getUserImageJsonByPk(
  id: number,
): Promise<Record<string, unknown> | null> {
  const row = await UserImage.findByPk(id);
  return row ? serializeUserImage(row) : null;
}
