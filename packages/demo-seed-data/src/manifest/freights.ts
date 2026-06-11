import { DEMO_FREIGHT_NAME_PREFIX } from '../constants';
import { DEMO_COMPANIES, type DemoCompanySpec } from './companies';

export type DemoRoutePoint = {
	label: string;
	lat: number;
	lng: number;
};

export type DemoFreightProposalSpec = {
	driverIndex: number;
	value: number;
	status: 'Enviada' | 'Recusada' | 'Aceita' | 'Nao Selecionada';
};

export type DemoFreightKind = 'operational' | 'history';

export type DemoFreightSpec = {
	companySlug: string;
	seq: number;
	name: string;
	cargoName: string;
	origin: DemoRoutePoint;
	destination: DemoRoutePoint;
	freightStatus:
		| 'Disponivel'
		| 'Cancelado'
		| 'Vinculado'
		| 'Em Transito'
		| 'Em Rota de Entrega'
		| 'Entregue'
		| 'Concluido';
	originalValue: number;
	finalValue?: number | null;
	weight: number;
	daysLimit?: number;
	assignedDriverIndex?: number;
	historyPath: DemoFreightSpec['freightStatus'][];
	proposals: DemoFreightProposalSpec[];
	kind?: DemoFreightKind;
	/** Dias atrás em que o frete foi concluído ou cancelado (histórico para gráficos). */
	timelineAnchorDaysAgo?: number;
};

const DEMO_HISTORY_COMPLETED_COUNT = 15;
const DEMO_HISTORY_CANCELLED_COUNT = 3;

const ROUTES: DemoRoutePoint[] = [
	{ label: 'São Paulo, SP', lat: -23.5505, lng: -46.6333 },
	{ label: 'Campinas, SP', lat: -22.9099, lng: -47.0626 },
	{ label: 'Ribeirão Preto, SP', lat: -21.1775, lng: -47.8103 },
	{ label: 'Curitiba, PR', lat: -25.4284, lng: -49.2733 },
	{ label: 'Londrina, PR', lat: -23.3045, lng: -51.1696 },
	{ label: 'Belo Horizonte, MG', lat: -19.9167, lng: -43.9345 },
	{ label: 'Uberlândia, MG', lat: -18.9186, lng: -48.2772 },
	{ label: 'Goiânia, GO', lat: -16.6869, lng: -49.2648 },
	{ label: 'Porto Alegre, RS', lat: -30.0346, lng: -51.2177 },
	{ label: 'Florianópolis, SC', lat: -27.5954, lng: -48.548 },
	{ label: 'Rio de Janeiro, RJ', lat: -22.9068, lng: -43.1729 },
	{ label: 'Santos, SP', lat: -23.9608, lng: -46.3332 },
	{ label: 'Paranaguá, PR', lat: -25.5163, lng: -48.5228 },
	{ label: 'Cuiabá, MT', lat: -15.601, lng: -56.0974 },
	{ label: 'Cascavel, PR', lat: -24.9555, lng: -53.4552 },
];

function routePair(seed: number): { origin: DemoRoutePoint; destination: DemoRoutePoint } {
	const origin = ROUTES[seed % ROUTES.length]!;
	const destination = ROUTES[(seed + 5) % ROUTES.length]!;
	return { origin, destination };
}

function spreadDaysAgo(index: number, total: number, maxDays = 90): number {
	if (total <= 1) return 1;
	const ratio = index / (total - 1);
	return Math.max(1, Math.round(maxDays * (1 - ratio)));
}

function buildAvailableProposals(baseValue: number, seed: number): DemoFreightProposalSpec[] {
	const offsets = [0.88, 0.92, 0.95, 0.9];
	return offsets.map((factor, index) => ({
		driverIndex: ((seed + index) % 10) + 1,
		value: Math.round(baseValue * factor),
		status: 'Enviada' as const,
	}));
}

function buildCompletedProposals(
	baseValue: number,
	acceptedDriverIndex: number,
	alternateDriverIndex: number,
): DemoFreightProposalSpec[] {
	return [
		{
			driverIndex: acceptedDriverIndex,
			value: Math.round(baseValue * 0.93),
			status: 'Aceita',
		},
		{
			driverIndex: alternateDriverIndex,
			value: Math.round(baseValue * 0.96),
			status: 'Nao Selecionada',
		},
	];
}

function buildFreightForCompany(company: DemoCompanySpec, seq: number, globalSeed: number): DemoFreightSpec {
	const cargoName = company.preferredCargoNames[(seq - 1) % company.preferredCargoNames.length]!;
	const { origin, destination } = routePair(globalSeed);
	const baseValue = 2500 + (globalSeed % 8) * 450;
	const weight = 8000 + (globalSeed % 6) * 2500;
	const name = `${DEMO_FREIGHT_NAME_PREFIX}${company.slug.toUpperCase()}-${String(seq).padStart(3, '0')}`;

	if (seq === 4 && globalSeed % 5 === 0) {
		return {
			companySlug: company.slug,
			seq,
			name,
			cargoName,
			origin,
			destination,
			freightStatus: 'Concluido',
			originalValue: baseValue,
			finalValue: Math.round(baseValue * 0.93),
			weight,
			daysLimit: 5,
			assignedDriverIndex: (globalSeed % 10) + 1,
			historyPath: ['Disponivel', 'Vinculado', 'Em Transito', 'Entregue', 'Concluido'],
			proposals: buildCompletedProposals(
				baseValue,
				(globalSeed % 10) + 1,
				((globalSeed + 1) % 10) + 1,
			),
			kind: 'operational',
		};
	}

	if (seq === 3 && globalSeed % 4 === 0) {
		return {
			companySlug: company.slug,
			seq,
			name,
			cargoName,
			origin,
			destination,
			freightStatus: 'Em Transito',
			originalValue: baseValue,
			finalValue: Math.round(baseValue * 0.94),
			weight,
			daysLimit: 4,
			assignedDriverIndex: ((globalSeed + 2) % 10) + 1,
			historyPath: ['Disponivel', 'Vinculado', 'Em Transito'],
			proposals: [
				{
					driverIndex: ((globalSeed + 2) % 10) + 1,
					value: Math.round(baseValue * 0.94),
					status: 'Aceita',
				},
			],
			kind: 'operational',
		};
	}

	return {
		companySlug: company.slug,
		seq,
		name,
		cargoName,
		origin,
		destination,
		freightStatus: 'Disponivel',
		originalValue: baseValue,
		weight,
		daysLimit: 3 + (globalSeed % 4),
		historyPath: ['Disponivel'],
		proposals: buildAvailableProposals(baseValue, globalSeed),
		kind: 'operational',
	};
}

function buildHistoryFreightsForCompany(company: DemoCompanySpec, companySeed: number): DemoFreightSpec[] {
	const freights: DemoFreightSpec[] = [];
	let historySeq = 0;

	for (let index = 0; index < DEMO_HISTORY_COMPLETED_COUNT; index += 1) {
		historySeq += 1;
		const globalSeed = companySeed * 100 + historySeq;
		const cargoName = company.preferredCargoNames[index % company.preferredCargoNames.length]!;
		const { origin, destination } = routePair(globalSeed);
		const baseValue = 3200 + (globalSeed % 12) * 380;
		const weight = 10000 + (globalSeed % 8) * 2200;
		const acceptedDriver = (globalSeed % 10) + 1;
		const name = `${DEMO_FREIGHT_NAME_PREFIX}${company.slug.toUpperCase()}-H${String(historySeq).padStart(3, '0')}`;

		freights.push({
			companySlug: company.slug,
			seq: historySeq,
			name,
			cargoName,
			origin,
			destination,
			freightStatus: 'Concluido',
			originalValue: baseValue,
			finalValue: Math.round(baseValue * (0.9 + (globalSeed % 5) * 0.02)),
			weight,
			daysLimit: 4 + (globalSeed % 3),
			assignedDriverIndex: acceptedDriver,
			historyPath: ['Disponivel', 'Vinculado', 'Em Transito', 'Entregue', 'Concluido'],
			proposals: buildCompletedProposals(baseValue, acceptedDriver, ((acceptedDriver % 10) + 1)),
			kind: 'history',
			timelineAnchorDaysAgo: spreadDaysAgo(index, DEMO_HISTORY_COMPLETED_COUNT),
		});
	}

	for (let index = 0; index < DEMO_HISTORY_CANCELLED_COUNT; index += 1) {
		historySeq += 1;
		const globalSeed = companySeed * 100 + historySeq + 50;
		const cargoName = company.preferredCargoNames[(index + 1) % company.preferredCargoNames.length]!;
		const { origin, destination } = routePair(globalSeed);
		const baseValue = 2800 + (globalSeed % 10) * 320;
		const weight = 9000 + (globalSeed % 6) * 1800;
		const name = `${DEMO_FREIGHT_NAME_PREFIX}${company.slug.toUpperCase()}-H${String(historySeq).padStart(3, '0')}`;

		freights.push({
			companySlug: company.slug,
			seq: historySeq,
			name,
			cargoName,
			origin,
			destination,
			freightStatus: 'Cancelado',
			originalValue: baseValue,
			finalValue: null,
			weight,
			daysLimit: 3,
			historyPath: ['Disponivel', 'Cancelado'],
			proposals: buildAvailableProposals(baseValue, globalSeed).slice(0, 2),
			kind: 'history',
			timelineAnchorDaysAgo: spreadDaysAgo(index, DEMO_HISTORY_CANCELLED_COUNT, 60),
		});
	}

	return freights;
}

export function buildDemoFreights(): DemoFreightSpec[] {
	const freights: DemoFreightSpec[] = [];
	let globalSeed = 0;

	for (let companyIndex = 0; companyIndex < DEMO_COMPANIES.length; companyIndex += 1) {
		const company = DEMO_COMPANIES[companyIndex]!;

		for (let seq = 1; seq <= 4; seq += 1) {
			globalSeed += 1;
			freights.push(buildFreightForCompany(company, seq, globalSeed));
		}

		freights.push(...buildHistoryFreightsForCompany(company, companyIndex + 1));
	}

	return freights;
}

export const DEMO_FREIGHTS: DemoFreightSpec[] = buildDemoFreights();
