import UserImage from '../models/userImages.model';

export function serializeUserImage(row: UserImage): Record<string, unknown> {
  const json = row.toJSON() as Record<string, unknown>;
  const fileName = typeof json.fileName === 'string' ? json.fileName : '';

  return {
    ...json,
    url: fileName ? `/api/uploads/user-images/${fileName}` : null,
  };
}

export async function getUserImageJsonByPk(
  id: number,
): Promise<Record<string, unknown> | null> {
  const row = await UserImage.findByPk(id);
  return row ? serializeUserImage(row) : null;
}
