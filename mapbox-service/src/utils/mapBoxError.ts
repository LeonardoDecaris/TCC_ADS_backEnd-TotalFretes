import { isAxiosError } from 'axios';
import { Response } from 'express';
import { z } from 'zod';
import { logger } from '../config/logger';
import { buildErrorResponseFields } from '../utils/errorResponse';
import { logError } from '../utils/logError';
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

function errorJson(res: Response, message: string, extra: Record<string, unknown> = {}) {
	const { requestId, errorId } = buildErrorResponseFields(res);
	return {
		message,
		error: message,
		requestId,
		errorId,
		...extra,
	};
}

export function handleControllerError(error: unknown, res: Response) {
	logError(logger, 'Mapbox controller error', error);

	if (error instanceof z.ZodError) {
		const message = error.message;
		return res.status(400).json(errorJson(res, message, { issues: error.issues }));
	}

	if (error instanceof Error && error.message === 'NOT_FOUND_REVERSE_GEOCODE') {
		const message = 'Endereço não encontrado para as coordenadas informadas';
		return res.status(404).json(errorJson(res, message));
	}

	if (isCoordinateError(error)) {
		const message = (error as Error).message;
		return res.status(400).json(errorJson(res, message));
	}

	const message = axiosErrorMessage(error);
	return res.status(500).json(errorJson(res, message));
}
