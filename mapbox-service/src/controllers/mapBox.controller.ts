import { Request, Response } from 'express';

import {
	forwardQuerySchema,
	normalizeRouteQuery,
	reverseQuerySchema,
	routeQuerySchema,
} from '../schemas/mapBox.schemas';
import {
	buildMapBoxRoute,
	forwardGeocode,
	reverseGeocode,
} from '../services/mapBox.service';
import { handleControllerError } from '../utils/mapBoxError';

export async function getMapBoxRoute(req: Request, res: Response) {
	try {
		const input = routeQuerySchema.parse(normalizeRouteQuery(req.query));
		const response = await buildMapBoxRoute(input);
		return res.json(response);
	} catch (error: unknown) {
		return handleControllerError(error, res);
	}
}

export async function geocodeForward(req: Request, res: Response) {
	try {
		const { q } = forwardQuerySchema.parse(req.query);
		const response = await forwardGeocode(q);
		return res.json(response);
	} catch (error: unknown) {
		return handleControllerError(error, res);
	}
}

export async function geocodeReverse(req: Request, res: Response) {
	try {
		const { lng, lat } = reverseQuerySchema.parse(req.query);
		const response = await reverseGeocode(lng, lat);
		return res.json(response);
	} catch (error: unknown) {
		return handleControllerError(error, res);
	}
}
