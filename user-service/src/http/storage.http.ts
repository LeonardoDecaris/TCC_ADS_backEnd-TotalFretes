import axios from 'axios';

export async function fetchUserImage(userImageId: number): Promise<unknown | null> {
  const base = (process.env.STORAGE_SERVICE_URL ?? '').replace(/\/$/, '');
  if (!base) return null;
  const token = process.env.INTERNAL_SERVICE_TOKEN ?? '';
  try {
    const res = await axios.get(`${base}/user-images/${userImageId}`, {
      timeout: 8000,
      validateStatus: (s) => s === 200,
      headers: token ? { 'X-Internal-Token': token } : {},
    });
    return res.data as unknown;
  } catch {
    return null;
  }
}
