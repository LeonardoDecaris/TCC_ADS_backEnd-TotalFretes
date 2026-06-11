import { NextFunction, Request, Response } from 'express';
import { getLocaleFromRequest } from '../utils/locale';
import { sendError } from '../services/httpResponse';

export const internalServiceMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const locale = getLocaleFromRequest(req);
	const configuredKey = process.env.INTERNAL_SERVICE_KEY?.trim();
	const providedKey = req.headers['x-service-key'];

	if (!configuredKey || typeof providedKey !== 'string' || providedKey.trim() !== configuredKey) {
		return sendError(res, 403, 'COMPANY.INTERNAL_UNAUTHORIZED', locale);
	}

	return next();
};
