import fs from 'fs';
import path from 'path';

export type DemoTelemetryPoint = {
	latitude: number;
	longitude: number;
	recordedAt: string;
	speed?: number;
	heading?: number;
};

export type DemoTelemetryTrail = {
	freightName: string;
	driverIndex: number;
	points: DemoTelemetryPoint[];
};

const telemetryFilePath = path.resolve(__dirname, 'data', 'telemetry-trails.json');

export const DEMO_TELEMETRY_TRAILS: DemoTelemetryTrail[] = JSON.parse(
	fs.readFileSync(telemetryFilePath, 'utf8'),
) as DemoTelemetryTrail[];
