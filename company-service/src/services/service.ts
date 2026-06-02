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
	ownerType?: 'USER' | 'COMPANY';
	ownerId?: number | null;
	url?: string | null;
};

type StorageImageEnvelope = {
	message?: string;
	userImage: StorageImageData;
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

export async function createAccountHttp(data: CreateAccountData) {
	const result = await authClient.post<{ ok: boolean }>('/account', data, {
		fallback: { ok: false },
		silentStatuses: [409],
	});
	return result.ok === 
	true;
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

export async function getUserImageHttp({ id }: { id: number }) {
	const result = await storageClient.get<StorageImageData | null>(`/user-images/${id}`, {
		fallback: null,
		silentStatuses: [404],
	});
	return result;
}

export async function uploadCompanyImageHttp({
	file,
	companyId,
}: {
	file: Express.Multer.File;
	companyId: number;
}) {
	const formData = new FormData();
	appendFileToFormData(formData, file);
	formData.append('ownerType', 'COMPANY');
	formData.append('ownerId', String(companyId));

	const response = await axios.post<StorageImageEnvelope>(
		`${storageServiceBaseUrl}/user-images/upload`,
		formData,
		{ maxBodyLength: Infinity },
	);

	return response.data;
}

export async function updateCompanyImageHttp({
	imageId,
	file,
}: {
	imageId: number;
	file: Express.Multer.File;
}) {
	const formData = new FormData();
	appendFileToFormData(formData, file);

	const response = await axios.put<StorageImageEnvelope>(
		`${storageServiceBaseUrl}/user-images/${imageId}`,
		formData,
		{ maxBodyLength: Infinity },
	);

	return response.data;
}

export async function deleteUserImageHttp({ id }: { id: number }) {
	const result = await storageClient.delete<{ message?: string; ok?: boolean }>(
		`/user-images/${id}`,
		{
			fallback: { ok: false },
			silentStatuses: [404],
		},
	);

	return result;
}