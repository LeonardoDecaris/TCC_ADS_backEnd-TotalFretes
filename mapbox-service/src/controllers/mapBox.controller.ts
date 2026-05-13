import { Request, Response } from 'express';
import axios, { isAxiosError } from 'axios';
import { z } from 'zod';

const coordPairRegex = /^[-+]?\d*\.?\d+,[-+]?\d*\.?\d+$/;

const forwardQuerySchema = z.object({
  q: z.string().trim().min(2, 'Consulta muito curta').max(256, 'Consulta muito longa'),
});

const reverseQuerySchema = z.object({
	lng: z.coerce.number().min(-180).max(180),
	lat: z.coerce.number().min(-90).max(90),
});

/** Express pode entregar query repetida ou com vírgula como array; o Zod espera string. */
function normalizeQueryParam(value: unknown): string | undefined {
	if (typeof value === 'string') return value;
	if (Array.isArray(value)) return value.map(String).join(',');
	return undefined;
}

function normalizeRouteQuery(query: Request['query']) {
	return {
		coordenadasMotorista: normalizeQueryParam(query.coordenadasMotorista),
		coordenadasOrigem: normalizeQueryParam(query.coordenadasOrigem),
		moradaCarga: normalizeQueryParam(query.moradaCarga),
		moradaDestino: normalizeQueryParam(query.moradaDestino),
	};
}

// moradaCarga obrigatória exceto quando coordenadasOrigem envia origem já em lon,lat
const querySchema = z
	.object({
		coordenadasMotorista: z
			.string()
			.regex(coordPairRegex, 'Formato inválido para coordenadas (longitude,latitude)')
			.optional(),
		coordenadasOrigem: z
			.string()
			.regex(coordPairRegex, 'Formato inválido para coordenadasOrigem (longitude,latitude)')
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

function getMapboxToken(): string {
	const token = process.env.MAPBOX_SECRET_TOKEN;
	if (!token) {
		throw new Error('MAPBOX_SECRET_TOKEN não configurado no .env');
	}
	return token;
}

// Helper function to call Mapbox Geocoding API
async function getCoordinates(address: string): Promise<[number, number]> {
	const token = getMapboxToken();

	const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`;
	const response = await axios.get(url, {
		params: {
			access_token: token,
			limit: 1,
		},
	});

	const features = response.data.features;
	if (!features || features.length === 0) {
		throw new Error(`Endereço não encontrado: ${address}`);
	}

	return features[0].center;
}

async function getRoute(coordinates: [number, number][]): Promise<any> {
	const token = getMapboxToken();

	const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates.map((coord) => coord.join(',')).join(';')}`;
	const response = await axios.get(url, {
		params: {
			access_token: token,
			geometries: 'geojson',
			overview: 'full',
			steps: true,
			language: 'pt',
		},
	});

	return response.data;
}

/** Une motorista→carga e carga→destino numa única LineString para o app. */
function mergeRouteGeometries(
	geomA: { type?: string; coordinates?: [number, number][] },
	geomB: { type?: string; coordinates?: [number, number][] },
): { type: 'LineString'; coordinates: [number, number][] } {
	const ca = geomA?.coordinates;
	const cb = geomB?.coordinates;
	if (!ca?.length && cb?.length) return { type: 'LineString', coordinates: cb };
	if (ca?.length && !cb?.length) return { type: 'LineString', coordinates: ca };
	if (!ca?.length || !cb?.length) return { type: 'LineString', coordinates: (ca ?? cb ?? []) as [number, number][] };
	const last = ca[ca.length - 1];
	const first = cb[0];
	const dup = last[0] === first[0] && last[1] === first[1];
	const merged = dup ? [...ca, ...cb.slice(1)] : [...ca, ...cb];
	return { type: 'LineString', coordinates: merged as [number, number][] };
}

/** Primeira instrução útil (texto + tipo/modificador para ícone no app). */
function pickPrimeiraInstrucao(route: any): {
	texto: string;
	modificador: string | null;
	tipo: string | null;
} | null {
	const legs = route?.legs;
	if (!Array.isArray(legs) || legs.length === 0) return null;

	const steps: any[] = [];
	for (const leg of legs) {
		if (Array.isArray(leg.steps)) steps.push(...leg.steps);
	}
	if (steps.length === 0) return null;

	const chosen =
		steps.find((s) => s.maneuver?.type && s.maneuver.type !== 'depart') ?? steps[0];
	const man = chosen.maneuver ?? {};
	const instr = (man.instruction as string | undefined)?.trim();
	const nomeRua = (chosen.name as string | undefined)?.trim();
	const texto = instr || (nomeRua ? `Em direção a ${nomeRua}` : 'Siga na rota');

	return {
		texto,
		modificador: (man.modifier as string) ?? null,
		tipo: (man.type as string) ?? null,
	};
}

function axiosErrorMessage(error: unknown): string {
	if (!isAxiosError(error)) return error instanceof Error ? error.message : 'Erro desconhecido';
	const d = error.response?.data;
	if (d && typeof d === 'object' && !Array.isArray(d)) {
		const o = d as { message?: string; error?: string };
		if (typeof o.message === 'string' && o.message.trim()) return o.message;
		if (typeof o.error === 'string' && o.error.trim()) return o.error;
	}
	if (typeof d === 'string' && d.trim()) return d;
	return error.message;
}

function handleControllerError(error: unknown, res: Response) {
	console.error(error);
	if (error instanceof z.ZodError) {
		return res.status(400).json({ error: error.message, issues: error.issues });
	}
	const msg = axiosErrorMessage(error);
	return res.status(500).json({ error: msg });
}

export async function getMapBoxRoute(req: Request, res: Response) {
	try {
		const { coordenadasMotorista, coordenadasOrigem, moradaCarga, moradaDestino } =
			querySchema.parse(normalizeRouteQuery(req.query));

		const destinoCoords = await getCoordinates(moradaDestino);

		let cargaCoords: [number, number];
		let mainRoute: any;
		let combinedGeometry: { type: 'LineString'; coordinates: [number, number][] };
		let totalDistanceM: number;
		let totalDurationS: number;
		let navRouteForHint: any;
		let trechoAteCarga: { distancia_km: number; tempo_min: number } | null = null;
		let trechoCargaAoDestino: { distancia_km: number; tempo_min: number };

		if (coordenadasOrigem) {
			const origemCoords = coordenadasOrigem.split(',').map(Number) as [number, number];
			cargaCoords = origemCoords;
			const routeData = await getRoute([origemCoords, destinoCoords]);
			mainRoute = routeData.routes[0];
			combinedGeometry = mainRoute.geometry;
			totalDistanceM = mainRoute.distance;
			totalDurationS = mainRoute.duration;
			navRouteForHint = mainRoute;
			const leg0 = mainRoute.legs[0];
			trechoCargaAoDestino = {
				distancia_km: leg0.distance / 1000,
				tempo_min: leg0.duration / 60,
			};
		} else {
			cargaCoords = await getCoordinates(moradaCarga as string);

			/* Sempre 2 pontos no Directions (carga→destino). Rota de 3 pontos costuma 422 no Mapbox. */
			const mainRouteData = await getRoute([cargaCoords, destinoCoords]);
			mainRoute = mainRouteData.routes[0];
			const mainLeg = mainRoute.legs[0];
			trechoCargaAoDestino = {
				distancia_km: mainLeg.distance / 1000,
				tempo_min: mainLeg.duration / 60,
			};

			combinedGeometry = mainRoute.geometry;
			totalDistanceM = mainRoute.distance;
			totalDurationS = mainRoute.duration;
			navRouteForHint = mainRoute;

			if (coordenadasMotorista?.trim()) {
				const parts = coordenadasMotorista.split(',');
				const lon = Number(parts[0]);
				const lat = Number(parts[1]);
				if (Number.isFinite(lon) && Number.isFinite(lat)) {
					const motoristaCoords: [number, number] = [lon, lat];
					try {
						const pickupData = await getRoute([motoristaCoords, cargaCoords]);
						const pickupRoute = pickupData.routes[0];
						const pLeg = pickupRoute.legs?.[0];
						if (pLeg) {
							trechoAteCarga = {
								distancia_km: pLeg.distance / 1000,
								tempo_min: pLeg.duration / 60,
							};
						}
						combinedGeometry = mergeRouteGeometries(pickupRoute.geometry, mainRoute.geometry);
						totalDistanceM = pickupRoute.distance + mainRoute.distance;
						totalDurationS = pickupRoute.duration + mainRoute.duration;
						navRouteForHint = pickupRoute;
					} catch (e) {
						console.warn('[mapbox] Trecho motorista→carga ignorado (422/outro)', axiosErrorMessage(e));
					}
				}
			}
		}

		const response: Record<string, unknown> = {
			distancia_total_km: totalDistanceM / 1000,
			tempo_total_min: totalDurationS / 60,
			coords_carga: cargaCoords,
			coords_destino: destinoCoords,
			geometria: combinedGeometry,
		};

		const navHint = pickPrimeiraInstrucao(navRouteForHint);
		if (navHint) {
			response.proxima_instrucao = navHint.texto;
			response.manobra_modificador = navHint.modificador;
			response.manobra_tipo = navHint.tipo;
		}

		response.trecho_ate_carga = trechoAteCarga;
		response.trecho_carga_ao_destino = trechoCargaAoDestino;

		res.json(response);
	} catch (error: unknown) {
		return handleControllerError(error, res);
	}
}

export async function geocodeForward(req: Request, res: Response) {
	try {
		const { q } = forwardQuerySchema.parse(req.query);
		const token = getMapboxToken();

		const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json`;
		let response = await axios.get(url, {
			params: {
				access_token: token,
				limit: 8,
				country: 'BR',
			},
		});

		let features = response.data?.features ?? [];
		if (features.length === 0) {
			response = await axios.get(url, {
				params: {
					access_token: token,
					limit: 8,
				},
			});
			features = response.data?.features ?? [];
		}

		const simplified = features.map((f: any) => ({
			id: f.id as string,
			place_name: f.place_name as string,
			center: f.center as [number, number],
		}));

		res.json({ features: simplified });
	} catch (error: unknown) {
		return handleControllerError(error, res);
	}
}

export async function geocodeReverse(req: Request, res: Response) {
	try {
		const { lng, lat } = reverseQuerySchema.parse(req.query);
		const token = getMapboxToken();

		const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json`;
		const response = await axios.get(url, {
			params: {
				access_token: token,
				limit: 1,
			},
		});

		const features = response.data?.features ?? [];
		if (features.length === 0) {
			return res.status(404).json({ error: 'Endereço não encontrado para as coordenadas informadas' });
		}

		const f = features[0];
		res.json({
			place_name: f.place_name as string,
			center: f.center as [number, number],
		});
	} catch (error: unknown) {
		return handleControllerError(error, res);
	}
}
