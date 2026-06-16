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
	points: readonly DemoTelemetryPoint[];
};

export const DEMO_TELEMETRY_TRAILS: readonly DemoTelemetryTrail[] = [
	{
		freightName: 'DEMO-COPACOL-001',
		driverIndex: 5,
		points: [
			{
				latitude: -24.6195,
				longitude: -53.3229,
				recordedAt: '2026-05-20T14:35:00.000Z',
				speed: 28,
				heading: 78,
			},
			{
				latitude: -24.9801,
				longitude: -52.5148,
				recordedAt: '2026-05-20T16:10:00.000Z',
				speed: 61,
				heading: 81,
			},
			{
				latitude: -25.2207,
				longitude: -51.5452,
				recordedAt: '2026-05-20T18:00:00.000Z',
				speed: 64,
				heading: 85,
			},
			{
				latitude: -25.4284,
				longitude: -49.2733,
				recordedAt: '2026-05-20T20:20:00.000Z',
				speed: 18,
				heading: 102,
			},
		],
	},
	{
		freightName: 'DEMO-SEARA-001',
		driverIndex: 6,
		points: [
			{
				latitude: -26.9083,
				longitude: -48.6705,
				recordedAt: '2026-05-08T13:10:00.000Z',
				speed: 24,
				heading: 16,
			},
			{
				latitude: -26.3948,
				longitude: -48.7933,
				recordedAt: '2026-05-08T15:20:00.000Z',
				speed: 66,
				heading: 10,
			},
			{
				latitude: -25.7999,
				longitude: -48.5093,
				recordedAt: '2026-05-08T17:40:00.000Z',
				speed: 64,
				heading: 13,
			},
			{
				latitude: -24.6346,
				longitude: -47.8968,
				recordedAt: '2026-05-08T20:10:00.000Z',
				speed: 62,
				heading: 24,
			},
			{
				latitude: -23.5505,
				longitude: -46.6333,
				recordedAt: '2026-05-09T16:45:00.000Z',
				speed: 12,
				heading: 32,
			},
		],
	},
	{
		freightName: 'DEMO-RAIZEN-001',
		driverIndex: 4,
		points: [
			{
				latitude: -23.5505,
				longitude: -46.6333,
				recordedAt: '2026-05-23T16:05:00.000Z',
				speed: 18,
				heading: 151,
			},
			{
				latitude: -23.7064,
				longitude: -46.5624,
				recordedAt: '2026-05-23T16:40:00.000Z',
				speed: 49,
				heading: 168,
			},
			{
				latitude: -23.8617,
				longitude: -46.4699,
				recordedAt: '2026-05-23T17:20:00.000Z',
				speed: 55,
				heading: 170,
			},
			{
				latitude: -23.9608,
				longitude: -46.3332,
				recordedAt: '2026-05-23T18:10:00.000Z',
				speed: 14,
				heading: 184,
			},
		],
	},
];
