import axios from 'axios';
import { logger } from '../config/logging';
import { logError } from '@total-fretes/logging';

type CompanyPaymentStatusResponse = {
	isPaid?: boolean;
};

function getCompanyServiceBaseUrl() {
	const baseUrl = process.env.COMPANY_SERVICE_URL?.trim();

	if (!baseUrl) {
		throw new Error('COMPANY_SERVICE_URL is not configured');
	}

	return baseUrl.replace(/\/$/, '');
}

function getInternalServiceKey() {
	const key = process.env.INTERNAL_SERVICE_KEY?.trim();

	if (!key) {
		throw new Error('INTERNAL_SERVICE_KEY is not configured');
	}

	return key;
}

export async function getCompanyPaymentStatus(subjectId: number): Promise<boolean | null> {
	try {
		const response = await axios.get<CompanyPaymentStatusResponse>(
			`${getCompanyServiceBaseUrl()}/company/internal/${subjectId}/payment-status`,
			{
				timeout: 3000,
				headers: {
					'X-Service-Key': getInternalServiceKey(),
				},
			},
		);

		return Boolean(response.data?.isPaid);
	} catch (error) {
		logError(logger, 'getCompanyPaymentStatus failed', error, { subjectId });
		return null;
	}
}
