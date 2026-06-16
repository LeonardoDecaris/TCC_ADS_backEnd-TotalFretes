import { NextFunction, Request, Response } from 'express';

export const internalServiceMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const configuredKey = process.env.INTERNAL_SERVICE_KEY?.trim();
	const providedKey = req.headers['x-service-key'];

	if (!configuredKey || typeof providedKey !== 'string' || providedKey.trim() !== configuredKey) {
		return res.status(403).json({ message: 'Unauthorized internal request' });
	}

	return next();
};
