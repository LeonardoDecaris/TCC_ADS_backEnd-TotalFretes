import { createHttpClient } from './httpClient';

const companyServiceBaseUrl =
  typeof process.env.COMPANY_SERVICE_URL === 'string' &&
  process.env.COMPANY_SERVICE_URL.trim() !== ''
    ? process.env.COMPANY_SERVICE_URL.trim()
    : 'http://company-service:3002';

const userServiceBaseUrl =
  typeof process.env.USER_SERVICE_URL === 'string' &&
  process.env.USER_SERVICE_URL.trim() !== ''
    ? process.env.USER_SERVICE_URL.trim()
    : 'http://user-service:3001';

const storageServiceBaseUrl =
  typeof process.env.STORAGE_SERVICE_URL === 'string' &&
  process.env.STORAGE_SERVICE_URL.trim() !== ''
    ? process.env.STORAGE_SERVICE_URL.trim()
    : 'http://storage-service:3007';

const companyClient = createHttpClient({ baseURL: companyServiceBaseUrl });
const userClient = createHttpClient({ baseURL: userServiceBaseUrl });
const storageClient = createHttpClient({ baseURL: storageServiceBaseUrl });

type ForwardHeaders = {
  authorization?: string;
  locale?: string;
};

export type StorageImageData = {
  id: number;
  originalName?: string;
  fileName?: string;
  path?: string;
  mimeType?: string;
  sizeBytes?: number;
  ownerType?: 'USER' | 'COMPANY';
  ownerId?: number | null;
  url?: string | null;
};

export type CompanyHttpResponse = {
  id: number;
  name?: string | null;
  CompanyAddress?: {
    city?: string | null;
    state?: string | null;
  } | null;
};

export type UserHttpResponse = {
  id: number;
  name?: string | null;
  userImage_id?: number | null;
  UserImage?: StorageImageData | null;
};

function buildForwardHeaders({ authorization, locale }: ForwardHeaders) {
  const headers: Record<string, string> = {};

  if (authorization) {
    headers.Authorization = authorization;
  }

  if (locale) {
    headers['accept-language'] = locale;
  }

  return headers;
}

export async function getCompanySummaryHttp({
  id,
  authorization,
  locale,
}: { id: number } & ForwardHeaders): Promise<CompanyHttpResponse | null> {
  return companyClient.get<CompanyHttpResponse | null>(`/company/${id}`, {
    headers: buildForwardHeaders({ authorization, locale }),
    fallback: null,
    silentStatuses: [401, 403, 404, 500],
  });
}

export async function getUserSummaryHttp({
  id,
  authorization,
  locale,
}: { id: number } & ForwardHeaders): Promise<UserHttpResponse | null> {
  return userClient.get<UserHttpResponse | null>(`/user/${id}`, {
    headers: buildForwardHeaders({ authorization, locale }),
    fallback: null,
    silentStatuses: [401, 403, 404, 500],
  });
}

export async function getUserImageHttp({ id }: { id: number }) {
  return storageClient.get<StorageImageData | null>(`/user-images/${id}`, {
    fallback: null,
    silentStatuses: [404],
  });
}
