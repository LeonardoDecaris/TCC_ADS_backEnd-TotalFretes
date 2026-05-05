import UserImage from '../models/userImages.model';

export async function getUserImageJsonByPk(
  id: number,
): Promise<Record<string, unknown> | null> {
  const row = await UserImage.findByPk(id);
  return row ? (row.toJSON() as Record<string, unknown>) : null;
}
