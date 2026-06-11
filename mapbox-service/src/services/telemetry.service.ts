import DriverLocation from '../models/driverLocation.model';
import { broadcastDriverLocation } from '../clients/freightWatchers';
import type { IngestLocationInput } from '../schemas/telemetry.schemas';

export type TrailPoint = {
  latitude: number;
  longitude: number;
  recordedAt: string;
};

export type LatestPosition = TrailPoint & {
  speed: number | null;
  heading: number | null;
};

export async function ingestDriverLocation(
  input: IngestLocationInput,
  driverId: number,
): Promise<TrailPoint> {
  const recordedAt = input.recordedAt ? new Date(input.recordedAt) : new Date();

  await DriverLocation.create({
    freight_id: input.freightId,
    driver_id: driverId,
    latitude: input.latitude,
    longitude: input.longitude,
    speed: input.speed ?? null,
    heading: input.heading ?? null,
    recorded_at: recordedAt,
  });

  const point: TrailPoint = {
    latitude: input.latitude,
    longitude: input.longitude,
    recordedAt: recordedAt.toISOString(),
  };

  broadcastDriverLocation({
    freightId: input.freightId,
    latitude: input.latitude,
    longitude: input.longitude,
    speed: input.speed ?? null,
    heading: input.heading ?? null,
    recordedAt: point.recordedAt,
  });

  return point;
}

export async function getFreightTrail(freightId: number): Promise<TrailPoint[]> {
  const rows = await DriverLocation.findAll({
    where: { freight_id: freightId },
    order: [['recorded_at', 'ASC']],
    attributes: ['latitude', 'longitude', 'recorded_at'],
  });

  return rows.map((row) => ({
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    recordedAt: row.recorded_at.toISOString(),
  }));
}

export async function getLatestDriverPosition(freightId: number): Promise<LatestPosition | null> {
  const row = await DriverLocation.findOne({
    where: { freight_id: freightId },
    order: [['recorded_at', 'DESC']],
    attributes: ['latitude', 'longitude', 'speed', 'heading', 'recorded_at'],
  });

  if (!row) return null;

  return {
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    speed: row.speed ?? null,
    heading: row.heading ?? null,
    recordedAt: row.recorded_at.toISOString(),
  };
}
