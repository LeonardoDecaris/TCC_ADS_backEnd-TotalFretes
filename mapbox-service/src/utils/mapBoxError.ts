import { isAxiosError } from 'axios';
import { Response } from 'express';
import { z } from 'zod';
import { logError, originFields } from '@total-fretes/observability';
import { logger } from '../config/logger';
import { isCoordinateError } from '../services/mapBox.service';

export function axiosErrorMessage(error: unknown): string {
	if (!isAxiosError(error)) return error instanceof Error ? error.message : 'Erro desconhecido';

	const data = error.response?.data;
	if (data && typeof data === 'object' && !Array.isArray(data)) {
		const payload = data as { message?: string; error?: string };
		if (typeof payload.message === 'string' && payload.message.trim()) return payload.message;
		if (typeof payload.error === 'string' && payload.error.trim()) return payload.error;
	}

	if (typeof data === 'string' && data.trim()) return data;
	return error.message;
}

function errorJson(message: string, error: unknown, extra: Record<string, unknown> = {}) {
	return {
		message,
		error: message,
		...originFields(error),
		...extra,
	};
}

export function handleControllerError(error: unknown, res: Response) {
	logError(logger, 'Mapbox controller error', error);

	if (error instanceof z.ZodError) {
		const message = error.message;
		return res.status(400).json(errorJson(message, error, { issues: error.issues }));
	}

	if (error instanceof Error && error.message === 'NOT_FOUND_REVERSE_GEOCODE') {
		const message = 'Endereço não encontrado para as coordenadas informadas';
		return res.status(404).json(errorJson(message, error));
	}

	if (isCoordinateError(error)) {
		const message = (error as Error).message;
		return res.status(400).json(errorJson(message, error));
	}

	const message = axiosErrorMessage(error);
	return res.status(500).json(errorJson(message, error));
}
