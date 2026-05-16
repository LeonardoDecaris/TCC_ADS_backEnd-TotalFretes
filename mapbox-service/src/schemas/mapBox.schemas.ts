import { Request } from 'express';
import { z } from 'zod';

const coordPairRegex = /^[-+]?\d*\.?\d+,[-+]?\d*\.?\d+$/;

function isValidCoordinatePair(value: string): boolean {
	const parts = value.split(',');
	if (parts.length !== 2) return false;

	const lon = Number(parts[0]);
	const lat = Number(parts[1]);
	if (!Number.isFinite(lon) || !Number.isFinite(lat)) return false;

	return lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90;
}

export const forwardQuerySchema = z.object({
	q: z.string().trim().min(2, 'Consulta muito curta').max(256, 'Consulta muito longa'),
});

export const reverseQuerySchema = z.object({
	lng: z.coerce.number().min(-180).max(180),
	lat: z.coerce.number().min(-90).max(90),
});

export const routeQuerySchema = z
	.object({
		coordenadasMotorista: z
			.string()
			.regex(coordPairRegex, 'Formato inválido para coordenadas (longitude,latitude)')
			.refine((v) => isValidCoordinatePair(v), {
				message: 'coordenadasMotorista fora do intervalo válido',
			})
			.optional(),
		coordenadasOrigem: z
			.string()
			.regex(coordPairRegex, 'Formato inválido para coordenadasOrigem (longitude,latitude)')
			.refine((v) => isValidCoordinatePair(v), {
				message: 'coordenadasOrigem fora do intervalo válido',
			})
			.optional(),
		moradaCarga: z.string().optional(),
		moradaDestino: z.string(),
	})
	.superRefine((val, ctx) => {
		if (!val.moradaCarga?.trim() && !val.coordenadasOrigem) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Informe moradaCarga ou coordenadasOrigem',
				path: ['moradaCarga'],
			});
		}

		if (val.coordenadasMotorista && val.coordenadasOrigem) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Use apenas um: coordenadasMotorista ou coordenadasOrigem',
				path: ['coordenadasOrigem'],
			});
		}
	});

function normalizeQueryParam(value: unknown): string | undefined {
	if (typeof value === 'string') return value;
	if (Array.isArray(value)) return value.map(String).join(',');
	return undefined;
}

export function normalizeRouteQuery(query: Request['query']) {
	return {
		coordenadasMotorista: normalizeQueryParam(query.coordenadasMotorista),
		coordenadasOrigem: normalizeQueryParam(query.coordenadasOrigem),
		moradaCarga: normalizeQueryParam(query.moradaCarga),
		moradaDestino: normalizeQueryParam(query.moradaDestino),
	};
}
