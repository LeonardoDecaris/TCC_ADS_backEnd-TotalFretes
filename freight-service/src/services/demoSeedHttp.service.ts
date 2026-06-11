import { createHttpClient } from './httpClient';

const storageServiceBaseUrl =
	typeof process.env.STORAGE_SERVICE_URL === 'string' &&
	process.env.STORAGE_SERVICE_URL.trim() !== ''
		? process.env.STORAGE_SERVICE_URL.trim()
		: 'http://storage-service:3007';

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

const storageClient = createHttpClient({ baseURL: storageServiceBaseUrl });
const companyClient = createHttpClient({ baseURL: companyServiceBaseUrl });
const userClient = createHttpClient({ baseURL: userServiceBaseUrl });

function internalHeaders(): Record<string, string> {
	const key = process.env.INTERNAL_SERVICE_KEY?.trim();
	return key ? { 'x-service-key': key } : {};
}

export type DemoCargoImageRow = { id: number; originalName: string };
export type DemoCompanyRow = { id: number; email: string; slug: string };
export type DemoDriverRow = { id: number; email: string; index: number };

async function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withDemoSeedRetry<T>(
	fn: () => Promise<T>,
	{ maxAttempts = 10, delayMs = 3000 }: { maxAttempts?: number; delayMs?: number } = {},
): Promise<T> {
	let lastError: unknown;
	for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
		try {
			return await fn();
		} catch (error) {
			lastError = error;
			if (attempt < maxAttempts) {
				await sleep(delayMs);
			}
		}
	}
	throw lastError;
}

export async function fetchDemoCargoImagesHttp(): Promise<DemoCargoImageRow[]> {
	return storageClient.get<DemoCargoImageRow[]>('/internal/seed/cargo-images', {
		headers: internalHeaders(),
		fallback: [],
		silentStatuses: [403, 404, 500],
	});
}

export async function fetchDemoCompaniesHttp(): Promise<DemoCompanyRow[]> {
	return companyClient.get<DemoCompanyRow[]>('/internal/seed/companies', {
		headers: internalHeaders(),
		fallback: [],
		silentStatuses: [403, 404, 500],
	});
}

export async function fetchDemoDriversHttp(): Promise<DemoDriverRow[]> {
	return userClient.get<DemoDriverRow[]>('/internal/seed/drivers', {
		headers: internalHeaders(),
		fallback: [],
		silentStatuses: [403, 404, 500],
	});
}
