import axios from "axios";
import { createHttpClient } from "./httpClient";

const storageServiceBaseUrl =
	typeof process.env.STORAGE_SERVICE_URL === 'string' &&
	process.env.STORAGE_SERVICE_URL.trim() !== ''
		? process.env.STORAGE_SERVICE_URL.trim()
		: 'http://storage-service:3007';

const authClient = createHttpClient({
	baseURL: process.env.AUTH_SERVICE_URL ?? '',
});

const storageClient = createHttpClient({
	baseURL: storageServiceBaseUrl,
});

const i18nClient = createHttpClient({
	baseURL: process.env.I18N_SERVICE_URL ?? '',
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

export async function createAccountHttp(data: CreateAccountData) {
	const result = await authClient.post<{ ok: boolean }>('/account', data, {
		fallback: { ok: false },
		silentStatuses: [409],
	});
	return result.ok === 
	true;
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

export async function getI18nHttp({ locale }: { locale: string }) {
	const result = await i18nClient.get<{ [key: string]: string }>(`/i18n/${locale}/company-service.json`, {
		fallback: {},
		silentStatuses: [404],
	});
	return result;
}