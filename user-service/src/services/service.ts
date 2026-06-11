import axios from 'axios';
import { createHttpClient } from "./httpClient"; 

const authClient = createHttpClient({
  baseURL: process.env.AUTH_SERVICE_URL ?? '',
});

const storageClient = createHttpClient({
  baseURL: process.env.STORAGE_SERVICE_URL ?? '',
});

export type CreateAccountData = {
  email: string;
  password: string;
  subject_id: number;
  account_type_id: number;
};

export async function createAccountHttp(data: CreateAccountData) {
  const baseURL = process.env.AUTH_SERVICE_URL ?? '';
  try {
    const response = await axios.post<{ ok?: boolean }>(`${baseURL}/account`, data);
    return response.data?.ok === true;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      return true;
    }
    return false;
  }
}

export async function deleteAccountHttp({ id }: { id: number }) {
  const result = await authClient.delete<{ ok: boolean }>(`/account/${id}`, {
    fallback: { ok: false },
    silentStatuses: [404],
  });
  return result.ok === true;
}

export async function getUserImageHttp({ id }: { id: number }) {
  const result = await storageClient.get(`/user-images/${id}`, {
    fallback: '',
    silentStatuses: [404],  
  });
  return result;
}

export async function getAccountTypeIdByName(name: string): Promise<number | null> {
  const types = await authClient.get<Array<{ id: number; name: string }>>('/account/types', {
    fallback: [],
    silentStatuses: [404, 500],
  });

  const match = types.find((type) => type.name === name);
  return match?.id ?? null;
}