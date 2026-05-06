import axios from 'axios';

export async function getUserImage(userImageId: number): Promise<unknown | null> {
  const base = (process.env.STORAGE_SERVICE_URL ?? '').replace(/\/$/, '');
  if (!base) return null;
  try {
    const res = await axios.get(`${base}/user-images/${userImageId}`, {
      timeout: 3000,
      validateStatus: (s) => s === 200,
    });
    return res.data as unknown;
  } catch {
    return null;
  }
}

