import { FreightStatusSlug, ProposalStatusSlug } from './statusTypes.constants';
import CargoType from '../models/cargoTypes.model';
import Freight from '../models/freight.model';
import FreightStatusHistory from '../models/freightStatusHistory.model';
import FreightStatusType from '../models/freightStatusTypes.model';
import Proposal from '../models/proposals.model';
import ProposalStatusType from '../models/proposalsStatusTypes.model';

export type SeedTestFreightsProposalsOptions = {
	companyId: number;
	driverIds: number[];
};

type TestProposalSpec = {
	driverIndex: number;
	status: (typeof ProposalStatusSlug)[keyof typeof ProposalStatusSlug];
	value: number;
};

type TestFreightSpec = {
	name: string;
	cargoName: string;
	origin_label: string;
	origin_lat: number;
	origin_lng: number;
	destination_label: string;
	destination_lat: number;
	destination_lng: number;
	freightStatus: (typeof FreightStatusSlug)[keyof typeof FreightStatusSlug];
	originalValue: number;
	finalValue?: number | null;
	weight: number;
	daysLimit?: number;
	assignedDriverIndex?: number;
	historyPath: ((typeof FreightStatusSlug)[keyof typeof FreightStatusSlug])[];
	proposals: TestProposalSpec[];
};

const TEST_FREIGHTS: TestFreightSpec[] = [
	{
		name: 'TF-TEST-0141',
		cargoName: 'Grãos',
		origin_label: 'Belo Horizonte, MG',
		origin_lat: -19.9167,
		origin_lng: -43.9345,
		destination_label: 'Rio de Janeiro, RJ',
		destination_lat: -22.9068,
		destination_lng: -43.1729,
		freightStatus: FreightStatusSlug.DISPONIVEL,
		originalValue: 6200,
		weight: 18000,
		daysLimit: 5,
		historyPath: [FreightStatusSlug.DISPONIVEL],
		proposals: [
			{ driverIndex: 0, status: ProposalStatusSlug.ENVIADA, value: 5500 },
			{ driverIndex: 1, status: ProposalStatusSlug.ENVIADA, value: 5800 },
			{ driverIndex: 2, status: ProposalStatusSlug.ENVIADA, value: 6000 },
		],
	},
	{
		name: 'TF-TEST-0142',
		cargoName: 'Minerais',
		origin_label: 'São Paulo, SP',
		origin_lat: -23.5505,
		origin_lng: -46.6333,
		destination_label: 'Curitiba, PR',
		destination_lat: -25.4284,
		destination_lng: -49.2733,
		freightStatus: FreightStatusSlug.DISPONIVEL,
		originalValue: 4800,
		weight: 12000,
		daysLimit: 3,
		historyPath: [FreightStatusSlug.DISPONIVEL],
		proposals: [
			{ driverIndex: 0, status: ProposalStatusSlug.ENVIADA, value: 4200 },
			{ driverIndex: 1, status: ProposalStatusSlug.ENVIADA, value: 4500 },
			{ driverIndex: 2, status: ProposalStatusSlug.RECUSADA, value: 4000 },
		],
	},
	{
		name: 'TF-TEST-0143',
		cargoName: 'Adubo',
		origin_label: 'Belo Horizonte, MG',
		origin_lat: -19.9167,
		origin_lng: -43.9345,
		destination_label: 'São Paulo, SP',
		destination_lat: -23.5505,
		destination_lng: -46.6333,
		freightStatus: FreightStatusSlug.CONCLUIDO,
		originalValue: 3500,
		finalValue: 3200,
		weight: 8000,
		daysLimit: 4,
		assignedDriverIndex: 0,
		historyPath: [
			FreightStatusSlug.DISPONIVEL,
			FreightStatusSlug.VINCULADO,
			FreightStatusSlug.EM_TRANSITO,
			FreightStatusSlug.ENTREGUE,
			FreightStatusSlug.CONCLUIDO,
		],
		proposals: [
			{ driverIndex: 0, status: ProposalStatusSlug.ACEITA, value: 3200 },
			{ driverIndex: 1, status: ProposalStatusSlug.NAO_SELECIONADA, value: 3400 },
			{ driverIndex: 2, status: ProposalStatusSlug.NAO_SELECIONADA, value: 3600 },
		],
	},
	{
		name: 'TF-TEST-0144',
		cargoName: 'Grãos',
		origin_label: 'Porto Alegre, RS',
		origin_lat: -30.0346,
		origin_lng: -51.2177,
		destination_label: 'Florianópolis, SC',
		destination_lat: -27.5954,
		destination_lng: -48.548,
		freightStatus: FreightStatusSlug.EM_TRANSITO,
		originalValue: 2900,
		finalValue: 2750,
		weight: 5000,
		daysLimit: 2,
		assignedDriverIndex: 1,
		historyPath: [
			FreightStatusSlug.DISPONIVEL,
			FreightStatusSlug.VINCULADO,
			FreightStatusSlug.EM_TRANSITO,
		],
		proposals: [{ driverIndex: 3, status: ProposalStatusSlug.ENVIADA, value: 2650 }],
	},
	{
		name: 'TF-TEST-0145',
		cargoName: 'Minerais',
		origin_label: 'Uberlândia, MG',
		origin_lat: -18.9186,
		origin_lng: -48.2772,
		destination_label: 'Goiânia, GO',
		destination_lat: -16.6869,
		destination_lng: -49.2648,
		freightStatus: FreightStatusSlug.DISPONIVEL,
		originalValue: 4100,
		weight: 15000,
		daysLimit: 6,
		historyPath: [FreightStatusSlug.DISPONIVEL],
		proposals: [
			{ driverIndex: 0, status: ProposalStatusSlug.ENVIADA, value: 3800 },
			{ driverIndex: 1, status: ProposalStatusSlug.ENVIADA, value: 3950 },
			{ driverIndex: 2, status: ProposalStatusSlug.ENVIADA, value: 3700 },
			{ driverIndex: 3, status: ProposalStatusSlug.ENVIADA, value: 3850 },
		],
	},
	{
		name: 'TF-TEST-0146',
		cargoName: 'Grãos',
		origin_label: 'Ribeirão Preto, SP',
		origin_lat: -21.1775,
		origin_lng: -47.8103,
		destination_label: 'Sorocaba, SP',
		destination_lat: -23.5015,
		destination_lng: -47.4526,
		freightStatus: FreightStatusSlug.CONCLUIDO,
		originalValue: 5600,
		finalValue: 5350,
		weight: 14000,
		daysLimit: 4,
		assignedDriverIndex: 2,
		historyPath: [
			FreightStatusSlug.DISPONIVEL,
			FreightStatusSlug.VINCULADO,
			FreightStatusSlug.EM_TRANSITO,
			FreightStatusSlug.EM_ROTA_ENTREGA,
			FreightStatusSlug.ENTREGUE,
			FreightStatusSlug.CONCLUIDO,
		],
		proposals: [
			{ driverIndex: 2, status: ProposalStatusSlug.ACEITA, value: 5350 },
			{ driverIndex: 1, status: ProposalStatusSlug.NAO_SELECIONADA, value: 5500 },
		],
	},
	{
		name: 'TF-TEST-0999',
		cargoName: 'Adubo',
		origin_label: 'Campinas, SP',
		origin_lat: -22.9099,
		origin_lng: -47.0626,
		destination_label: 'Santos, SP',
		destination_lat: -23.9608,
		destination_lng: -46.3332,
		freightStatus: FreightStatusSlug.CANCELADO,
		originalValue: 2000,
		weight: 3000,
		daysLimit: 1,
		historyPath: [
			FreightStatusSlug.DISPONIVEL,
			FreightStatusSlug.VINCULADO,
			FreightStatusSlug.CANCELADO,
		],
		proposals: [{ driverIndex: 0, status: ProposalStatusSlug.ENVIADA, value: 1800 }],
	},
];

const getStatusIdByName = async (
	model: typeof FreightStatusType | typeof ProposalStatusType,
	name: string
): Promise<number> => {
	const row = await model.findOne({ where: { name }, attributes: ['id'] });
	if (row?.id == null) {
		throw new Error(`Status "${name}" não encontrado. Rode o freight-service para criar os catálogos.`);
	}
	return row.id;
};

const resolveDriverId = (driverIds: number[], index: number): number => {
	const id = driverIds[index];
	if (id == null || Number.isNaN(id)) {
		throw new Error(
			`Motorista no índice ${index} não definido. Configure SEED_TEST_DRIVER_IDS (ex.: 2,3,4,5).`
		);
	}
	return id;
};

const buildHistoryDates = (length: number): Date[] => {
	const now = new Date();
	const oldest = new Date(now);
	oldest.setDate(oldest.getDate() - Math.max(length, 2));

	return Array.from({ length }, (_, index) => {
		const occurredAt = new Date(oldest);
		occurredAt.setHours(oldest.getHours() + index * 12);
		return occurredAt;
	});
};

/**
 * Seed idempotente de fretes e propostas para testes da tela /Proposals.
 * Fretes identificados por `name` (prefixo TF-TEST-). Propostas por (freight_id, driver_id).
 */
export const seedTestFreightsProposals = async (
	options: SeedTestFreightsProposalsOptions
): Promise<{ freights: number; proposals: number }> => {
	const { companyId, driverIds } = options;

	if (driverIds.length < 4) {
		throw new Error('Informe ao menos 4 IDs em SEED_TEST_DRIVER_IDS (ex.: 2,3,4,5).');
	}

	const freightStatusIds = new Map<string, number>();
	for (const name of Object.values(FreightStatusSlug)) {
		freightStatusIds.set(name, await getStatusIdByName(FreightStatusType, name));
	}

	const proposalStatusIds = new Map<string, number>();
	for (const name of Object.values(ProposalStatusSlug)) {
		proposalStatusIds.set(name, await getStatusIdByName(ProposalStatusType, name));
	}

	let freightCount = 0;
	let proposalCount = 0;

	for (const spec of TEST_FREIGHTS) {
		const cargo = await CargoType.findOne({ where: { name: spec.cargoName }, attributes: ['id'] });
		if (!cargo?.id) {
			throw new Error(`Tipo de carga "${spec.cargoName}" não encontrado.`);
		}

		const statusId = freightStatusIds.get(spec.freightStatus);
		if (statusId == null) {
			throw new Error(`Status de frete "${spec.freightStatus}" não encontrado.`);
		}

		const assignedDriver_id =
			spec.assignedDriverIndex != null
				? resolveDriverId(driverIds, spec.assignedDriverIndex)
				: null;

		const [freight, freightCreated] = await Freight.findOrCreate({
			where: { company_id: companyId, name: spec.name },
			defaults: {
				company_id: companyId,
				name: spec.name,
				cargoType_id: cargo.id,
				origin_label: spec.origin_label,
				origin_lat: spec.origin_lat,
				origin_lng: spec.origin_lng,
				destination_label: spec.destination_label,
				destination_lat: spec.destination_lat,
				destination_lng: spec.destination_lng,
				status_id: statusId,
				assignedDriver_id,
				daysLimit: spec.daysLimit ?? null,
				originalValue: spec.originalValue,
				finalValue: spec.finalValue ?? null,
				weight: spec.weight,
			},
		});

		if (!freightCreated) {
			await freight.update({
				cargoType_id: cargo.id,
				origin_label: spec.origin_label,
				origin_lat: spec.origin_lat,
				origin_lng: spec.origin_lng,
				destination_label: spec.destination_label,
				destination_lat: spec.destination_lat,
				destination_lng: spec.destination_lng,
				status_id: statusId,
				assignedDriver_id,
				daysLimit: spec.daysLimit ?? null,
				originalValue: spec.originalValue,
				finalValue: spec.finalValue ?? null,
				weight: spec.weight,
			});
		}

		await FreightStatusHistory.destroy({ where: { freight_id: freight.id! } });

		const historyStatusIds = spec.historyPath
			.map((statusName) => freightStatusIds.get(statusName))
			.filter((statusId): statusId is number => statusId != null);

		const historyDates = buildHistoryDates(historyStatusIds.length);

		for (let index = 0; index < historyStatusIds.length; index += 1) {
			await FreightStatusHistory.create({
				freight_id: freight.id!,
				status_id: historyStatusIds[index],
				occurred_at: historyDates[index],
			});
		}

		freightCount += 1;

		for (const proposalSpec of spec.proposals) {
			const driver_id = resolveDriverId(driverIds, proposalSpec.driverIndex);
			const status_id = proposalStatusIds.get(proposalSpec.status);
			if (status_id == null) {
				throw new Error(`Status de proposta "${proposalSpec.status}" não encontrado.`);
			}

			const [, proposalCreated] = await Proposal.findOrCreate({
				where: { freight_id: freight.id!, driver_id },
				defaults: {
					freight_id: freight.id!,
					driver_id,
					status_id,
					value: proposalSpec.value,
				},
			});

			if (!proposalCreated) {
				await Proposal.update(
					{ status_id, value: proposalSpec.value },
					{ where: { freight_id: freight.id!, driver_id } }
				);
			}

			proposalCount += 1;
		}
	}

	return { freights: freightCount, proposals: proposalCount };
};
