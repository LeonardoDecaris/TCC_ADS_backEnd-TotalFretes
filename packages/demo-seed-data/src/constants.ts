export const DEMO_EMAIL_DOMAIN = 'seed.totalfretes.demo';

export const DEMO_COMPANY_EMAIL_PREFIX = 'demo.';

export const DEMO_DRIVER_EMAIL_PREFIX = 'demo.motorista.';

export const DEMO_FREIGHT_NAME_PREFIX = 'DEMO-';

export const DEFAULT_DEMO_COMPANY_PASSWORD = 'Empresa@123456';

export const DEFAULT_DEMO_DRIVER_PASSWORD = 'Motorista@123456';

export function isDemoSeedEnabled(): boolean {
	const raw = process.env.DEMO_DATA_SEED_ENABLED?.trim().toLowerCase();
	return raw === 'true' || raw === '1';
}

export function isDemoSeedOnStartupEnabled(): boolean {
	const raw = process.env.DEMO_DATA_SEED_ON_STARTUP?.trim().toLowerCase();
	return raw === 'true' || raw === '1';
}

export function demoCompanyEmail(slug: string): string {
	return `${DEMO_COMPANY_EMAIL_PREFIX}${slug}@${DEMO_EMAIL_DOMAIN}`;
}

export function demoDriverEmail(index: number): string {
	return `${DEMO_DRIVER_EMAIL_PREFIX}${String(index).padStart(2, '0')}@${DEMO_EMAIL_DOMAIN}`;
}

export function isDemoCompanyEmail(email: string): boolean {
	const normalized = email.trim().toLowerCase();
	return normalized.startsWith(DEMO_COMPANY_EMAIL_PREFIX) && normalized.endsWith(`@${DEMO_EMAIL_DOMAIN}`);
}

export function isDemoDriverEmail(email: string): boolean {
	const normalized = email.trim().toLowerCase();
	return normalized.startsWith(DEMO_DRIVER_EMAIL_PREFIX) && normalized.endsWith(`@${DEMO_EMAIL_DOMAIN}`);
}
