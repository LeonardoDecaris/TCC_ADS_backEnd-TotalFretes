import axios from 'axios';

import { DEMO_TELEMETRY_TRAILS } from './telemetry.constants';

import DriverLocation from '../models/driverLocation.model';
import { logger } from './logging';

type DriverRow = { id: number; index: number };
type FreightRow = { id: number; name: string; assignedDriver_id: number | null };

const userServiceBaseUrl =
	typeof process.env.USER_SERVICE_URL === 'string' && process.env.USER_SERVICE_URL.trim() !== ''
		? process.env.USER_SERVICE_URL.trim()
		: 'http://user-service:3001';

const freightServiceBaseUrl =
	typeof process.env.FREIGHT_SERVICE_URL === 'string' && process.env.FREIGHT_SERVICE_URL.trim() !== ''
		? process.env.FREIGHT_SERVICE_URL.trim()
		: 'http://freight-service:3008';

const internalHeaders = (): Record<string, string> => {
	const key = process.env.INTERNAL_SERVICE_KEY?.trim();
	return key ? { 'x-service-key': key } : {};
};

async function fetchDemoDrivers(): Promise<DriverRow[]> {
	const response = await axios.get<DriverRow[]>(`${userServiceBaseUrl}/internal/seed/drivers`, {
		headers: internalHeaders(),
		timeout: 10000,
	});
	return response.data;
}

async function fetchDemoFreights(): Promise<FreightRow[]> {
	const response = await axios.get<FreightRow[]>(`${freightServiceBaseUrl}/internal/seed/freights`, {
		headers: internalHeaders(),
		timeout: 10000,
	});
	return response.data;
}

export async function seedDemoTelemetryTrails(): Promise<{ trails: number; points: number }> {
	const drivers = await fetchDemoDrivers();
	const freights = await fetchDemoFreights();

	const driverIdByIndex = new Map<number, number>(drivers.map((row) => [row.index, row.id]));
	const freightByName = new Map<string, FreightRow>(freights.map((row) => [row.name, row]));

	let trailCount = 0;
	let pointCount = 0;

	for (const trail of DEMO_TELEMETRY_TRAILS) {
		const driverId = driverIdByIndex.get(trail.driverIndex);
		const freight = freightByName.get(trail.freightName);

		if (!driverId || !freight?.id) {
			logger.warn(`Demo telemetry seed skipped trail ${trail.freightName} (driver/freight not found)`);
			continue;
		}

		await DriverLocation.destroy({ where: { freight_id: freight.id } });

		for (const point of trail.points) {
			await DriverLocation.create({
				freight_id: freight.id,
				driver_id: driverId,
				latitude: point.latitude,
				longitude: point.longitude,
				speed: point.speed ?? null,
				heading: point.heading ?? null,
				recorded_at: new Date(point.recordedAt),
			});
			pointCount += 1;
		}

		trailCount += 1;
	}

	logger.info(`Demo telemetry seed completed (trails=${trailCount}, points=${pointCount})`);
	return { trails: trailCount, points: pointCount };
}
