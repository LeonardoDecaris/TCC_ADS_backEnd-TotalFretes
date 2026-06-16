import { FreightStatusSlug, ProposalStatusSlug } from './statusTypes.constants';

export const DEMO_FREIGHT_NAME_PREFIX = 'DEMO-';

export type DemoRoutePoint = {
	label: string;
	lat: number;
	lng: number;
};

export type DemoFreightProposalSpec = {
	driverIndex: number;
	value: number;
	status:
		| typeof ProposalStatusSlug.ENVIADA
		| typeof ProposalStatusSlug.RECUSADA
		| typeof ProposalStatusSlug.ACEITA
		| typeof ProposalStatusSlug.NAO_SELECIONADA;
};

export type DemoFreightStatusName =
	| 'Disponivel'
	| 'Cancelado'
	| 'Vinculado'
	| 'Em Transito'
	| 'Em Rota de Entrega'
	| 'Entregue'
	| 'Concluido';

export type DemoFreightSpec = {
	companySlug: string;
	seq: number;
	name: string;
	cargoName: string;
	origin: DemoRoutePoint;
	destination: DemoRoutePoint;
	freightStatus: DemoFreightStatusName;
	originalValue: number;
	finalValue?: number | null;
	weight: number;
	daysLimit?: number;
	assignedDriverIndex?: number;
	historyPath: readonly DemoFreightStatusName[];
	historyOccurredAt: readonly string[];
	proposals: readonly DemoFreightProposalSpec[];
};

type RoutePair = {
	origin: DemoRoutePoint;
	destination: DemoRoutePoint;
};

type CompanyFreightConfig = {
	slug: string;
	namePrefix: string;
	count: number;
	routes: RoutePair[];
	cargos: readonly string[];
	valueRange: readonly [number, number];
	weightRange: readonly [number, number];
};

const DRIVER_INDICES = [1, 2, 3, 4, 5, 6] as const;

const STATUS_SCENARIOS: ReadonlyArray<{
	freightStatus: DemoFreightStatusName;
	historyPath: readonly DemoFreightStatusName[];
	needsDriver: boolean;
}> = [
	{ freightStatus: FreightStatusSlug.DISPONIVEL, historyPath: [FreightStatusSlug.DISPONIVEL], needsDriver: false },
	{
		freightStatus: FreightStatusSlug.VINCULADO,
		historyPath: [FreightStatusSlug.DISPONIVEL, FreightStatusSlug.VINCULADO],
		needsDriver: true,
	},
	{
		freightStatus: FreightStatusSlug.EM_TRANSITO,
		historyPath: [FreightStatusSlug.DISPONIVEL, FreightStatusSlug.VINCULADO, FreightStatusSlug.EM_TRANSITO],
		needsDriver: true,
	},
	{
		freightStatus: FreightStatusSlug.EM_ROTA_ENTREGA,
		historyPath: [
			FreightStatusSlug.DISPONIVEL,
			FreightStatusSlug.VINCULADO,
			FreightStatusSlug.EM_TRANSITO,
			FreightStatusSlug.EM_ROTA_ENTREGA,
		],
		needsDriver: true,
	},
	{
		freightStatus: FreightStatusSlug.ENTREGUE,
		historyPath: [
			FreightStatusSlug.DISPONIVEL,
			FreightStatusSlug.VINCULADO,
			FreightStatusSlug.EM_TRANSITO,
			FreightStatusSlug.ENTREGUE,
		],
		needsDriver: true,
	},
	{
		freightStatus: FreightStatusSlug.CONCLUIDO,
		historyPath: [
			FreightStatusSlug.DISPONIVEL,
			FreightStatusSlug.VINCULADO,
			FreightStatusSlug.EM_TRANSITO,
			FreightStatusSlug.ENTREGUE,
			FreightStatusSlug.CONCLUIDO,
		],
		needsDriver: true,
	},
	{
		freightStatus: FreightStatusSlug.CANCELADO,
		historyPath: [FreightStatusSlug.DISPONIVEL, FreightStatusSlug.CANCELADO],
		needsDriver: false,
	},
];

const COMPANY_CONFIGS: readonly CompanyFreightConfig[] = [
	{
		slug: 'coamo',
		namePrefix: 'COAMO',
		count: 50,
		cargos: ['Soja', 'Milho', 'Trigo', 'Grãos', 'Farelo de Soja'],
		valueRange: [3800, 6200],
		weightRange: [16000, 28000],
		routes: [
			{
				origin: { label: 'Campo Mourão, PR', lat: -24.0433, lng: -52.3781 },
				destination: { label: 'Santos, SP', lat: -23.9608, lng: -46.3332 },
			},
			{
				origin: { label: 'Londrina, PR', lat: -23.3045, lng: -51.1696 },
				destination: { label: 'Campinas, SP', lat: -22.9099, lng: -47.0626 },
			},
			{
				origin: { label: 'Maringá, PR', lat: -23.4205, lng: -51.9333 },
				destination: { label: 'Paranaguá, PR', lat: -25.5163, lng: -48.5228 },
			},
			{
				origin: { label: 'Cascavel, PR', lat: -24.9578, lng: -53.4595 },
				destination: { label: 'Rio Grande, RS', lat: -32.0349, lng: -52.0986 },
			},
		],
	},
	{
		slug: 'cargill',
		namePrefix: 'CARGILL',
		count: 50,
		cargos: ['Soja', 'Milho', 'Farelo de Soja', 'Grãos', 'Sorgo'],
		valueRange: [3500, 5800],
		weightRange: [14000, 26000],
		routes: [
			{
				origin: { label: 'São Paulo, SP', lat: -23.5505, lng: -46.6333 },
				destination: { label: 'Ribeirão Preto, SP', lat: -21.1775, lng: -47.8103 },
			},
			{
				origin: { label: 'Uberlândia, MG', lat: -18.9186, lng: -48.2772 },
				destination: { label: 'Santos, SP', lat: -23.9608, lng: -46.3332 },
			},
			{
				origin: { label: 'Dourados, MS', lat: -22.2211, lng: -54.8056 },
				destination: { label: 'São Paulo, SP', lat: -23.5505, lng: -46.6333 },
			},
		],
	},
	{
		slug: 'frimesa',
		namePrefix: 'FRIMESA',
		count: 50,
		cargos: ['Congelados', 'Carnes Frigorificadas', 'Sorvete', 'Laticínios'],
		valueRange: [4200, 6500],
		weightRange: [12000, 22000],
		routes: [
			{
				origin: { label: 'Medianeira, PR', lat: -25.2954, lng: -54.0939 },
				destination: { label: 'Curitiba, PR', lat: -25.4284, lng: -49.2733 },
			},
			{
				origin: { label: 'Cascavel, PR', lat: -24.9578, lng: -53.4595 },
				destination: { label: 'São Paulo, SP', lat: -23.5505, lng: -46.6333 },
			},
			{
				origin: { label: 'Chapecó, SC', lat: -27.1004, lng: -52.6152 },
				destination: { label: 'Florianópolis, SC', lat: -27.5954, lng: -48.5480 },
			},
		],
	},
	{
		slug: 'copacol',
		namePrefix: 'COPACOL',
		count: 50,
		cargos: ['Congelados', 'Carnes Frigorificadas', 'Milho', 'Soja'],
		valueRange: [4000, 6000],
		weightRange: [13000, 24000],
		routes: [
			{
				origin: { label: 'Cafelândia, PR', lat: -24.6195, lng: -53.3229 },
				destination: { label: 'Curitiba, PR', lat: -25.4284, lng: -49.2733 },
			},
			{
				origin: { label: 'Guarapuava, PR', lat: -25.3905, lng: -51.4623 },
				destination: { label: 'Porto Alegre, RS', lat: -30.0346, lng: -51.2177 },
			},
			{
				origin: { label: 'Ponta Grossa, PR', lat: -25.0916, lng: -50.1668 },
				destination: { label: 'Joinville, SC', lat: -26.3045, lng: -48.8487 },
			},
		],
	},
	{
		slug: 'seara',
		namePrefix: 'SEARA',
		count: 50,
		cargos: ['Congelados', 'Carnes Frigorificadas', 'Sorvete', 'Bovinos'],
		valueRange: [4500, 6800],
		weightRange: [14000, 25000],
		routes: [
			{
				origin: { label: 'Itajaí, SC', lat: -26.9083, lng: -48.6705 },
				destination: { label: 'São Paulo, SP', lat: -23.5505, lng: -46.6333 },
			},
			{
				origin: { label: 'Lages, SC', lat: -27.8163, lng: -50.3264 },
				destination: { label: 'Curitiba, PR', lat: -25.4284, lng: -49.2733 },
			},
			{
				origin: { label: 'Concórdia, SC', lat: -27.2335, lng: -52.0261 },
				destination: { label: 'Belo Horizonte, MG', lat: -19.9167, lng: -43.9345 },
			},
		],
	},
	{
		slug: 'jbs',
		namePrefix: 'JBS',
		count: 10,
		cargos: ['Congelados', 'Carnes Frigorificadas', 'Bovinos'],
		valueRange: [3600, 5500],
		weightRange: [10000, 20000],
		routes: [
			{
				origin: { label: 'Goiânia, GO', lat: -16.6869, lng: -49.2648 },
				destination: { label: 'Belo Horizonte, MG', lat: -19.9167, lng: -43.9345 },
			},
			{
				origin: { label: 'Campo Grande, MS', lat: -20.4697, lng: -54.6201 },
				destination: { label: 'São Paulo, SP', lat: -23.5505, lng: -46.6333 },
			},
		],
	},
	{
		slug: 'raizen',
		namePrefix: 'RAIZEN',
		count: 10,
		cargos: ['Etanol Hidratado', 'Diesel S10', 'Cana-de-açúcar', 'Gasolina A'],
		valueRange: [5500, 7200],
		weightRange: [20000, 32000],
		routes: [
			{
				origin: { label: 'São Paulo, SP', lat: -23.5505, lng: -46.6333 },
				destination: { label: 'Santos, SP', lat: -23.9608, lng: -46.3332 },
			},
			{
				origin: { label: 'Paulínia, SP', lat: -22.7611, lng: -47.1543 },
				destination: { label: 'Rio de Janeiro, RJ', lat: -22.9068, lng: -43.1729 },
			},
			{
				origin: { label: 'Ribeirão Preto, SP', lat: -21.1775, lng: -47.8103 },
				destination: { label: 'Curitiba, PR', lat: -25.4284, lng: -49.2733 },
			},
		],
	},
];

function pickDriver(seed: number): number {
	return DRIVER_INDICES[seed % DRIVER_INDICES.length]!;
}

function pickOtherDrivers(primary: number, count: number, seed: number): number[] {
	const result: number[] = [];
	for (let offset = 1; result.length < count; offset += 1) {
		const candidate = pickDriver(seed + offset);
		if (candidate !== primary && !result.includes(candidate)) {
			result.push(candidate);
		}
	}
	return result;
}

function buildHistoryDates(pathLength: number, baseDayOffset: number): string[] {
	const dates: string[] = [];
	for (let index = 0; index < pathLength; index += 1) {
		const day = baseDayOffset + index;
		const hour = 8 + index * 3;
		dates.push(new Date(Date.UTC(2026, 0, 5 + day, hour, 0, 0)).toISOString());
	}
	return dates;
}

function buildProposals(
	scenario: (typeof STATUS_SCENARIOS)[number],
	seq: number,
	originalValue: number,
): DemoFreightProposalSpec[] {
	const primaryDriver = pickDriver(seq);
	const discount = 80 + (seq % 5) * 20;

	if (scenario.freightStatus === FreightStatusSlug.DISPONIVEL) {
		const bidders = pickOtherDrivers(primaryDriver, 2, seq);
		return [
			{ driverIndex: primaryDriver, value: originalValue - discount, status: ProposalStatusSlug.ENVIADA },
			{ driverIndex: bidders[0]!, value: originalValue - discount + 50, status: ProposalStatusSlug.ENVIADA },
			...(bidders[1]
				? [{ driverIndex: bidders[1]!, value: originalValue - discount + 120, status: ProposalStatusSlug.ENVIADA }]
				: []),
		];
	}

	if (scenario.freightStatus === FreightStatusSlug.CANCELADO) {
		const others = pickOtherDrivers(primaryDriver, 2, seq);
		return [
			{ driverIndex: primaryDriver, value: originalValue - discount, status: ProposalStatusSlug.RECUSADA },
			{ driverIndex: others[0]!, value: originalValue - discount + 40, status: ProposalStatusSlug.RECUSADA },
		];
	}

	const acceptedValue = originalValue - discount;
	const others = pickOtherDrivers(primaryDriver, 2, seq);
	return [
		{ driverIndex: primaryDriver, value: acceptedValue, status: ProposalStatusSlug.ACEITA },
		{ driverIndex: others[0]!, value: acceptedValue + 70, status: ProposalStatusSlug.NAO_SELECIONADA },
		...(others[1]
			? [{ driverIndex: others[1]!, value: acceptedValue + 140, status: ProposalStatusSlug.NAO_SELECIONADA }]
			: []),
	];
}

function buildCompanyFreights(config: CompanyFreightConfig): DemoFreightSpec[] {
	const freights: DemoFreightSpec[] = [];

	for (let seq = 1; seq <= config.count; seq += 1) {
		const seed = seq + config.count;
		const scenario = STATUS_SCENARIOS[(seq - 1) % STATUS_SCENARIOS.length]!;
		const route = config.routes[(seq - 1) % config.routes.length]!;
		const cargoName = config.cargos[(seq - 1) % config.cargos.length]!;
		const valueSpan = config.valueRange[1] - config.valueRange[0];
		const weightSpan = config.weightRange[1] - config.weightRange[0];
		const originalValue = config.valueRange[0] + (seq % 7) * Math.floor(valueSpan / 7);
		const weight = config.weightRange[0] + (seq % 5) * Math.floor(weightSpan / 5);
		const proposals = buildProposals(scenario, seed, originalValue);
		const acceptedProposal = proposals.find((p) => p.status === ProposalStatusSlug.ACEITA);
		const assignedDriverIndex = scenario.needsDriver
			? (acceptedProposal?.driverIndex ?? pickDriver(seed))
			: undefined;
		const historyPath = scenario.historyPath;
		const historyOccurredAt = buildHistoryDates(historyPath.length, seq * 2);
		const hasFinalValue =
			scenario.freightStatus !== FreightStatusSlug.DISPONIVEL &&
			scenario.freightStatus !== FreightStatusSlug.CANCELADO;

		freights.push({
			companySlug: config.slug,
			seq,
			name: `DEMO-${config.namePrefix}-${String(seq).padStart(3, '0')}`,
			cargoName,
			origin: route.origin,
			destination: route.destination,
			freightStatus: scenario.freightStatus,
			originalValue,
			finalValue: hasFinalValue ? originalValue - (80 + (seq % 4) * 30) : null,
			weight,
			daysLimit: 2 + (seq % 4),
			assignedDriverIndex,
			historyPath,
			historyOccurredAt,
			proposals,
		});
	}

	return freights;
}

function buildDemoFreights(): DemoFreightSpec[] {
	return COMPANY_CONFIGS.flatMap((config) => buildCompanyFreights(config));
}

/** 50 fretes: coamo, cargill, frimesa, copacol, seara. 10 fretes: jbs, raizen. Total: 270. */
export const DEMO_FREIGHTS: readonly DemoFreightSpec[] = buildDemoFreights();
