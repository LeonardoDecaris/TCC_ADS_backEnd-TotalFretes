import axios from 'axios';
import { AxiosError } from 'axios';

export async function deleteAccountHttp({ id }: { id: number }) {
    const base = (process.env.AUTH_SERVICE_URL ?? '')

    try {
        const response = await axios.delete(`${base}/'account'/${id}`, {
            timeout: 3000,
            headers: { 'Content-Type': 'application/json' },
        });

        return response.data?.ok === true;
    } catch (error) {
        if (error instanceof AxiosError) {
            if (error.response?.status === 404) {
                return false;
            }
        }
        return false;
    }
}
