import { isAxiosError } from 'axios';
import { Response } from 'express';
import { z } from 'zod';

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

export function handleControllerError(error: unknown, res: Response) {
	console.error(error);

	if (error instanceof z.ZodError) {
		return res.status(400).json({ error: error.message, issues: error.issues });
	}

	if (error instanceof Error && error.message === 'NOT_FOUND_REVERSE_GEOCODE') {
		return res
			.status(404)
			.json({ error: 'Endereço não encontrado para as coordenadas informadas' });
	}

	if (isCoordinateError(error)) {
		return res.status(400).json({ error: (error as Error).message });
	}

	const message = axiosErrorMessage(error);
	return res.status(500).json({ error: message });
}
