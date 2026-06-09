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

export async function createAccountHttp(data: CreateAccountData) {
	const result = await authClient.post<{ ok: boolean }>('/account', data, {
		fallback: { ok: false },
		silentStatuses: [409],
	});
	return result.ok === true;
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