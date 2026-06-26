import axios from "axios";
import { createHttpClient } from "./httpClient";

const storageServiceBaseUrl =
	typeof process.env.STORAGE_SERVICE_URL === 'string' &&
	process.env.STORAGE_SERVICE_URL.trim() !== ''
		? process.env.STORAGE_SERVICE_URL.trim()
		: 'http://storage-service:3007';
const freightServiceBaseUrl =
	typeof process.env.FREIGHT_SERVICE_URL === 'string' &&
	process.env.FREIGHT_SERVICE_URL.trim() !== ''
		? process.env.FREIGHT_SERVICE_URL.trim()
		: 'http://freight-service:3008';

const authClient = createHttpClient({
	baseURL: process.env.AUTH_SERVICE_URL ?? '',
});

const storageClient = createHttpClient({
	baseURL: storageServiceBaseUrl,
});

const freightClient = createHttpClient({
	baseURL: freightServiceBaseUrl,
});

export type StorageImageData = {
	id: number;
	originalName?: string;
	fileName?: string;
	path?: string;
	mimeType?: string;
	sizeBytes?: number;
	companyId?: number | null;
	url?: string | null;
};

type CompanyImageEnvelope = {
	message?: string;
	companyImage: StorageImageData;
};

export type CreateAccountData = {
	email: string;
	password: string;
	subject_id: number;
	account_type_id: number;
};

type ForwardHeaders = {
	authorization?: string;
	locale?: string;
};

export type FreightListItem = {
	id?: number;
	status?: {
		name?: string | null;
	} | null;
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

export type CreateAccountResult =
	| { ok: true }
	| { ok: false; reason: 'exists' | 'error' };

export async function createAccountHttp(data: CreateAccountData): Promise<CreateAccountResult> {
	const baseURL = (process.env.AUTH_SERVICE_URL ?? '').replace(/\/$/, '');
	try {
		const response = await axios.post<{ ok?: boolean }>(`${baseURL}/account`, data, { timeout: 5000 });
		return response.data?.ok === true ? { ok: true } : { ok: false, reason: 'error' };
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.status === 409) {
			return { ok: false, reason: 'exists' };
		}
		return { ok: false, reason: 'error' };
	}
}

export async function getAccountTypeIdByName(name: string): Promise<number | null> {
	const types = await authClient.get<Array<{ id: number; name: string }>>('/account/types', {
		fallback: [],
		silentStatuses: [404, 500],
	});

	const match = types.find((type) => type.name === name);
	return match?.id ?? null;
}

export async function deleteOwnAccountBySubjectHttp({
	subjectId,
	authorization,
	locale,
}: {
	subjectId: number;
	authorization?: string;
	locale?: string;
}) {
	return authClient.delete<{ message?: string; ok?: boolean }>(`/account/subject/${subjectId}`, {
		headers: buildForwardHeaders({ authorization, locale }),
		fallback: { ok: false },
		silentStatuses: [404],
	});
}

export async function getAuthenticatedCompanyFreightsHttp({
	authorization,
	locale,
}: ForwardHeaders) {
	return freightClient.get<FreightListItem[]>('/freight', {
		headers: buildForwardHeaders({ authorization, locale }),
		fallback: [],
		silentStatuses: [404],
	});
}

function appendFileToFormData(formData: FormData, file: Express.Multer.File) {
	const binary = new Uint8Array(file.buffer);

	formData.append(
		'image',
		new Blob([binary], { type: file.mimetype }),
		file.originalname,
	);
}

export async function getCompanyImageHttp({ id }: { id: number }) {
	const result = await storageClient.get<StorageImageData | null>(`/company-images/${id}`, {
		fallback: null,
		silentStatuses: [404],
	});
	return result;
}

export async function uploadCompanyImageHttp({
	file,
	companyId,
	authorization,
}: {
	file: Express.Multer.File;
	companyId: number;
	authorization?: string;
}) {
	const formData = new FormData();
	appendFileToFormData(formData, file);
	formData.append('companyId', String(companyId));

	const response = await axios.post<CompanyImageEnvelope>(
		`${storageServiceBaseUrl}/company-images/upload`,
		formData,
		{
			maxBodyLength: Infinity,
			headers: buildForwardHeaders({ authorization }),
		},
	);

	return {
		message: response.data.message,
		userImage: response.data.companyImage,
	};
}

export async function updateCompanyImageHttp({
	imageId,
	file,
	authorization,
}: {
	imageId: number;
	file: Express.Multer.File;
	authorization?: string;
}) {
	const formData = new FormData();
	appendFileToFormData(formData, file);

	const response = await axios.put<CompanyImageEnvelope>(
		`${storageServiceBaseUrl}/company-images/${imageId}`,
		formData,
		{
			maxBodyLength: Infinity,
			headers: buildForwardHeaders({ authorization }),
		},
	);

	return {
		message: response.data.message,
		userImage: response.data.companyImage,
	};
}

export async function deleteCompanyImageHttp({
	id,
	authorization,
	locale,
}: {
	id: number;
	authorization?: string;
	locale?: string;
}) {
	const result = await storageClient.delete<{ message?: string; ok?: boolean }>(
		`/company-images/${id}`,
		{
			headers: buildForwardHeaders({ authorization, locale }),
			fallback: { ok: false },
			silentStatuses: [404],
		},
	);

	return result;
}

type DemoCompanyImageResponse = {
	companyImage?: StorageImageData | null;
};

export async function registerDemoCompanyImageHttp({
	companyId,
	logoFile,
}: {
	companyId: number;
	logoFile: string;
}): Promise<StorageImageData | null> {
	const internalKey = process.env.INTERNAL_SERVICE_KEY?.trim();
	if (!internalKey) return null;

	const result = await storageClient.post<DemoCompanyImageResponse>(
		'/internal/seed/company-images',
		{ companyId, logoFile },
		{
			headers: { 'x-service-key': internalKey },
			fallback: {},
			silentStatuses: [400, 404, 500],
		},
	);

	return result.companyImage ?? null;
}