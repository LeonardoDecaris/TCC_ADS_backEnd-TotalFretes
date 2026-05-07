import { createHttpClient } from "./httpClient"; 

const authClient = createHttpClient({
  baseURL: process.env.AUTH_SERVICE_URL ?? '',
});

const storageClient = createHttpClient({
  baseURL: process.env.STORAGE_SERVICE_URL ?? '',
});

const i18nClient = createHttpClient({
  baseURL: process.env.I18N_SERVICE_URL ?? '',
});

export type CreateAccountData = {
  email: string;
  password: string;
  subject_id: number;
  account_type_id: number;
};

export async function createAccountHttp(data: CreateAccountData) {
  const result = await authClient.post<{ ok: boolean }>('/account', data, {
    fallback: { ok: false },
    silentStatuses: [409],
  });
  return result.ok === true;
}

export async function deleteAccountHttp({ id }: { id: number }) {
  const result = await authClient.delete<{ ok: boolean }>(`/account/${id}`, {
    fallback: { ok: false },
    silentStatuses: [404],
  });
  return result.ok === true;
}

export async function getUserImageHttp({ id }: { id: number }) {
  const result = await storageClient.get<{ url: string }>(`/user-images/${id}`, {
    fallback: { url: '' },
    silentStatuses: [404],
  });
  return result.url;
}

export async function getI18nHttp({ locale }: { locale: string }) {
  const result = await i18nClient.get<{ [key: string]: string }>(`/i18n/${locale}/user-service.json`, {
    fallback: {},
    silentStatuses: [404],
  });
  return result;
}