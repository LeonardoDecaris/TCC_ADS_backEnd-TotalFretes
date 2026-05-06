import axios from 'axios';
import { AxiosError } from 'axios';

export type CreateAccountData = {
  email: string;
  password: string;
  subject_id: number;
  account_type_id: number;
};

export async function createAccountHttp(data: CreateAccountData) {
  const base = (process.env.AUTH_SERVICE_URL ?? '')

  try {
    const response = await axios.post(`${base}/account`, data, {
      timeout: 3000,
      headers: { 'Content-Type': 'application/json' },
    });

    return response.data?.ok === true;
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 409) {
        return false;
      }
    }
    return false;
  }
}
