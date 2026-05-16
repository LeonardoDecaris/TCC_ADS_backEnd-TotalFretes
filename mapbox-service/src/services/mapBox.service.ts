import axios from 'axios';

const GEO_CACHE_TTL_MS = 30 * 60 * 1000;
const ROUTE_CACHE_TTL_MS = 45 * 1000;
const MAX_GEO_CACHE_ITEMS = 500;
const MAX_ROUTE_CACHE_ITEMS = 350;

type Coordinate = [number, number];

type CacheEntry<T> = {
	value: T;
	expiresAt: number;
};

type MapboxRouteStep = {
	maneuver?: {
		instruction?: string;
		modifier?: string;
		type?: string;
	};
	name?: string;
};

type MapboxRouteLeg = {
	distance: number;
	duration: number;
	steps?: MapboxRouteStep[];
};

type MapboxRoute = {
	distance: number;
	duration: number;
	geometry: { type?: string; coordinates?: Coordinate[] };
	legs: MapboxRouteLeg[];
};

type MapboxDirectionsResponse = {
	routes: MapboxRoute[];
};

type MapboxGeocodeFeature = {
	id: string;
	place_name: string;
	center: Coordinate;
};

type RouteInput = {
	coordenadasMotorista?: string;
	coordenadasOrigem?: string;
	moradaCarga?: string;
	moradaDestino: string;
};

const geocodeCache = new Map<string, CacheEntry<Coordinate>>();
const routeCache = new Map<string, CacheEntry<MapboxDirectionsResponse>>();

function setCacheEntry<T>(
	store: Map<string, CacheEntry<T>>,
	key: string,
	value: T,
	ttlMs: number,
	maxItems: number,
): void {
	if (store.size >= maxItems) {
		const oldest = store.keys().next().value;
		if (oldest) store.delete(oldest);
	}
	store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

function getCacheEntry<T>(store: Map<string, CacheEntry<T>>, key: string): T | null {
	const found = store.get(key);
	if (!found) return null;
	if (found.expiresAt <= Date.now()) {
		store.delete(key);
		return null;
	}
	return found.value;
}

function getMapboxToken(): string {
	const token = process.env.MAPBOX_SECRET_TOKEN;
	if (!token) {
		throw new Error('MAPBOX_SECRET_TOKEN não configurado no .env');
	}
	return token;
}

function parseCoordinatePair(value: string, fieldLabel: string): Coordinate {
	const parts = value.split(',');
	const lon = Number(parts[0]);
	const lat = Number(parts[1]);

	if (!Number.isFinite(lon) || !Number.isFinite(lat)) {
		throw new Error(`Coordenadas inválidas para ${fieldLabel}`);
	}
	if (lon < -180 || lon > 180 || lat < -90 || lat > 90) {
		throw new Error(`Coordenadas fora do limite para ${fieldLabel}`);
	}
	return [lon, lat];
}

async function getCoordinates(address: string): Promise<Coordinate> {
	const cacheKey = address.trim().toLowerCase();
	const cached = getCacheEntry(geocodeCache, cacheKey);
	if (cached) return cached;

	const token = getMapboxToken();
	const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`;

	const response = await axios.get<{ features?: MapboxGeocodeFeature[] }>(url, {
		params: {
			access_token: token,
			limit: 1,
		},
	});

	const features = response.data.features;
	if (!features || features.length === 0) {
		throw new Error(`Endereço não encontrado: ${address}`);
	}

	const center = features[0].center;
	setCacheEntry(geocodeCache, cacheKey, center, GEO_CACHE_TTL_MS, MAX_GEO_CACHE_ITEMS);
	return center;
}

async function getRoute(coordinates: Coordinate[]): Promise<MapboxDirectionsResponse> {
	const cacheKey = coordinates.map((coord) => coord.join(',')).join(';');
	const cached = getCacheEntry(routeCache, cacheKey);
	if (cached) return cached;

	const token = getMapboxToken();
	const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates
		.map((coord) => coord.join(','))
		.join(';')}`;

	const response = await axios.get<MapboxDirectionsResponse>(url, {
		params: {
			access_token: token,
			geometries: 'geojson',
			overview: 'full',
			steps: true,
			language: 'pt',
		},
	});

	const data = response.data;
	setCacheEntry(routeCache, cacheKey, data, ROUTE_CACHE_TTL_MS, MAX_ROUTE_CACHE_ITEMS);
	return data;
}

function mergeCoordinates(a: Coordinate[] = [], b: Coordinate[] = []): Coordinate[] {
	if (!a.length) return b;
	if (!b.length) return a;
	const last = a[a.length - 1];
	const first = b[0];
	const isDuplicateJoin = last[0] === first[0] && last[1] === first[1];
	return isDuplicateJoin ? [...a, ...b.slice(1)] : [...a, ...b];
}

function mergeRouteGeometries(
	geomA: { type?: string; coordinates?: Coordinate[] },
	geomB: { type?: string; coordinates?: Coordinate[] },
): { type: 'LineString'; coordinates: Coordinate[] } {
	return {
		type: 'LineString',
		coordinates: mergeCoordinates(geomA?.coordinates, geomB?.coordinates),
	};
}

function pickPrimeiraInstrucao(route: MapboxRoute): {
	texto: string;
	modificador: string | null;
	tipo: string | null;
} | null {
	const legs = route?.legs;
	if (!Array.isArray(legs) || legs.length === 0) return null;

	const steps: MapboxRouteStep[] = [];
	for (const leg of legs) {
		if (Array.isArray(leg.steps)) steps.push(...leg.steps);
	}
	if (steps.length === 0) return null;

	const chosen =
		steps.find((s) => s.maneuver?.type && s.maneuver.type !== 'depart') ?? steps[0];
	const maneuver = chosen.maneuver ?? {};
	const instruction = maneuver.instruction?.trim();
	const streetName = chosen.name?.trim();
	const text = instruction || (streetName ? `Em direção a ${streetName}` : 'Siga na rota');

	return {
		texto: text,
		modificador: maneuver.modifier ?? null,
		tipo: maneuver.type ?? null,
	};
}

function getMainRouteOrThrow(routeData: MapboxDirectionsResponse): MapboxRoute {
	const route = routeData.routes?.[0];
	if (!route) throw new Error('Rota não encontrada no Mapbox');
	return route;
}

export function isCoordinateError(error: unknown): boolean {
	return error instanceof Error && error.message.toLowerCase().includes('coordenadas');
}

export async function buildMapBoxRoute(input: RouteInput): Promise<Record<string, unknown>> {
	const { coordenadasMotorista, coordenadasOrigem, moradaCarga, moradaDestino } = input;

	const destinoCoords = await getCoordinates(moradaDestino);

	let cargaCoords: Coordinate;
	let mainRoute: MapboxRoute;
	let combinedGeometry: { type: 'LineString'; coordinates: Coordinate[] };
	let totalDistanceM: number;
	let totalDurationS: number;
	let navRouteForHint: MapboxRoute;
	let trechoAteCarga: { distancia_km: number; tempo_min: number } | null = null;
	let trechoCargaAoDestino: { distancia_km: number; tempo_min: number };

	if (coordenadasOrigem) {
		const origemCoords = parseCoordinatePair(coordenadasOrigem, 'coordenadasOrigem');
		cargaCoords = origemCoords;
		const routeData = await getRoute([origemCoords, destinoCoords]);
		mainRoute = getMainRouteOrThrow(routeData);
		combinedGeometry = {
			type: 'LineString',
			coordinates: mainRoute.geometry?.coordinates ?? [],
		};
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
		const mainRouteData = await getRoute([cargaCoords, destinoCoords]);
		mainRoute = getMainRouteOrThrow(mainRouteData);
		const mainLeg = mainRoute.legs[0];

		trechoCargaAoDestino = {
			distancia_km: mainLeg.distance / 1000,
			tempo_min: mainLeg.duration / 60,
		};

		combinedGeometry = {
			type: 'LineString',
			coordinates: mainRoute.geometry?.coordinates ?? [],
		};
		totalDistanceM = mainRoute.distance;
		totalDurationS = mainRoute.duration;
		navRouteForHint = mainRoute;

		if (coordenadasMotorista?.trim()) {
			const motoristaCoords = parseCoordinatePair(
				coordenadasMotorista,
				'coordenadasMotorista',
			);

			try {
				const pickupData = await getRoute([motoristaCoords, cargaCoords]);
				const pickupRoute = getMainRouteOrThrow(pickupData);
				const pickupLeg = pickupRoute.legs?.[0];
				if (pickupLeg) {
					trechoAteCarga = {
						distancia_km: pickupLeg.distance / 1000,
						tempo_min: pickupLeg.duration / 60,
					};
				}
				combinedGeometry = mergeRouteGeometries(pickupRoute.geometry, mainRoute.geometry);
				totalDistanceM = pickupRoute.distance + mainRoute.distance;
				totalDurationS = pickupRoute.duration + mainRoute.duration;
				navRouteForHint = pickupRoute;
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Erro desconhecido';
				console.warn('[mapbox] Trecho motorista→carga ignorado (422/outro)', message);
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

	return response;
}

export async function forwardGeocode(q: string): Promise<{ features: MapboxGeocodeFeature[] }> {
	const token = getMapboxToken();
	const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json`;

	let response = await axios.get<{ features?: MapboxGeocodeFeature[] }>(url, {
		params: {
			access_token: token,
			limit: 8,
			country: 'BR',
		},
	});

	let features = response.data?.features ?? [];
	if (features.length === 0) {
		response = await axios.get<{ features?: MapboxGeocodeFeature[] }>(url, {
			params: {
				access_token: token,
				limit: 8,
			},
		});
		features = response.data?.features ?? [];
	}

	return {
		features: features.map((feature) => ({
			id: feature.id,
			place_name: feature.place_name,
			center: feature.center,
		})),
	};
}

export async function reverseGeocode(lng: number, lat: number): Promise<{
	place_name: string;
	center: Coordinate;
}> {
	const token = getMapboxToken();
	const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json`;

	const response = await axios.get<{ features?: MapboxGeocodeFeature[] }>(url, {
		params: {
			access_token: token,
			limit: 1,
		},
	});

	const features = response.data?.features ?? [];
	if (features.length === 0) {
		throw new Error('NOT_FOUND_REVERSE_GEOCODE');
	}

	const feature = features[0];
	return {
		place_name: feature.place_name,
		center: feature.center,
	};
}
