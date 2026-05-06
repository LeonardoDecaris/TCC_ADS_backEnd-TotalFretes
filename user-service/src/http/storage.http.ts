import axios from 'axios';
import { AxiosError } from 'axios';

export async function getUserImage({ id }: { id: number }) {
  const base = (process.env.STORAGE_SERVICE_URL ?? '')
  try {
    const response = await axios.get(`${base}/user-images/${id}`, {
      timeout: 3000,
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 404) {
        return null;
      }
    }
    return null;
  }
}

