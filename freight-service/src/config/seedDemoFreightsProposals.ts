import { FreightStatusSlug, ProposalStatusSlug } from './statusTypes.constants';
import { DEMO_FREIGHTS, type DemoFreightSpec } from './freights.constants';
import CargoType from '../models/cargoTypes.model';
import Freight from '../models/freight.model';
import FreightStatusHistory from '../models/freightStatusHistory.model';
import FreightStatusType from '../models/freightStatusTypes.model';
import Proposal from '../models/proposals.model';
import ProposalStatusType from '../models/proposalsStatusTypes.model';
import {
	fetchDemoCompaniesHttp,
	fetchDemoDriversHttp,
	withDemoSeedRetry,
	type DemoCompanyRow,
	type DemoDriverRow,
} from '../services/demoSeedHttp.service';
import { logger } from '../config/logging';

const getStatusIdByName = async (
	model: typeof FreightStatusType | typeof ProposalStatusType,
	name: string,
): Promise<number> => {
	const row = await model.findOne({ where: { name }, attributes: ['id'] });
	if (row?.id == null) {
		throw new Error(`Status "${name}" não encontrado. Rode o freight-service para criar os catálogos.`);
	}
	return row.id;
};

const parseHistoryDates = (values: readonly string[]): Date[] =>
	values
		.map((value) => new Date(value))
		.filter((date) => !Number.isNaN(date.getTime()));

const resolveDriverId = (drivers: DemoDriverRow[], index: number): number => {
	const driver = drivers.find((row) => row.index === index);
	if (!driver?.id) {
		throw new Error(`Motorista demo no índice ${index} não encontrado.`);
	}
	return driver.id;
};

const resolveCompanyId = (companies: DemoCompanyRow[], slug: string): number => {
	const company = companies.find((row) => row.slug === slug);
	if (!company?.id) {
		throw new Error(`Empresa demo "${slug}" não encontrada.`);
	}
	return company.id;
};

export const seedDemoFreightsProposals = async (): Promise<{ freights: number; proposals: number }> => {
	const companies = await withDemoSeedRetry(async () => {
		const rows = await fetchDemoCompaniesHttp();
		if (rows.length === 0) throw new Error('Demo companies catalog is empty');
		return rows;
	});

	const drivers = await withDemoSeedRetry(async () => {
		const rows = await fetchDemoDriversHttp();
		if (rows.length < 4) throw new Error('Demo drivers catalog requires at least 4 drivers');
		return rows;
	});

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

	for (const spec of DEMO_FREIGHTS) {
		try {
			await upsertDemoFreight(spec, companies, drivers, freightStatusIds, proposalStatusIds);
			freightCount += 1;
			proposalCount += spec.proposals.length;
		} catch (error) {
			logger.error(`Demo freight seed failed for ${spec.name}`, error);
		}
	}

	logger.info(`Demo freights/proposals seed completed (freights=${freightCount}, proposals=${proposalCount})`);
	return { freights: freightCount, proposals: proposalCount };
};

async function upsertDemoFreight(
	spec: DemoFreightSpec,
	companies: DemoCompanyRow[],
	drivers: DemoDriverRow[],
	freightStatusIds: Map<string, number>,
	proposalStatusIds: Map<string, number>,
): Promise<void> {
	const companyId = resolveCompanyId(companies, spec.companySlug);
	const cargo = await CargoType.findOne({ where: { name: spec.cargoName }, attributes: ['id'] });
	if (!cargo?.id) {
		throw new Error(`Tipo de carga "${spec.cargoName}" não encontrado.`);
	}

	const statusId = freightStatusIds.get(spec.freightStatus);
	if (statusId == null) {
		throw new Error(`Status de frete "${spec.freightStatus}" não encontrado.`);
	}

	const assignedDriver_id =
		spec.assignedDriverIndex != null ? resolveDriverId(drivers, spec.assignedDriverIndex) : null;

	const freightCreatedAt = new Date(spec.createdAt);
	const freightUpdatedAt = new Date(spec.updatedAt);
	if (Number.isNaN(freightCreatedAt.getTime()) || Number.isNaN(freightUpdatedAt.getTime())) {
		throw new Error(`Datas inválidas para "${spec.name}".`);
	}

	const [freight] = await Freight.findOrCreate({
		where: { company_id: companyId, name: spec.name },
		defaults: {
			company_id: companyId,
			name: spec.name,
			cargoType_id: cargo.id,
			origin_label: spec.origin.label,
			origin_lat: spec.origin.lat,
			origin_lng: spec.origin.lng,
			destination_label: spec.destination.label,
			destination_lat: spec.destination.lat,
			destination_lng: spec.destination.lng,
			status_id: statusId,
			assignedDriver_id,
			daysLimit: spec.daysLimit ?? null,
			originalValue: spec.originalValue,
			finalValue: spec.finalValue ?? null,
			weight: spec.weight,
			createdAt: freightCreatedAt,
			updatedAt: freightUpdatedAt,
		},
	});

	await freight.update(
		{
			cargoType_id: cargo.id,
			origin_label: spec.origin.label,
			origin_lat: spec.origin.lat,
			origin_lng: spec.origin.lng,
			destination_label: spec.destination.label,
			destination_lat: spec.destination.lat,
			destination_lng: spec.destination.lng,
			status_id: statusId,
			assignedDriver_id,
			daysLimit: spec.daysLimit ?? null,
			originalValue: spec.originalValue,
			finalValue: spec.finalValue ?? null,
			weight: spec.weight,
			createdAt: freightCreatedAt,
			updatedAt: freightUpdatedAt,
		},
		{ silent: true },
	);

	await FreightStatusHistory.destroy({ where: { freight_id: freight.id! } });

	const historyStatusIds = spec.historyPath
		.map((statusName) => freightStatusIds.get(statusName))
		.filter((statusId: number | undefined): statusId is number => statusId != null);

	const historyDates = parseHistoryDates(spec.historyOccurredAt ?? []);
	if (historyDates.length !== historyStatusIds.length) {
		throw new Error(
			`Histórico inválido para "${spec.name}": historyPath=${historyStatusIds.length}, historyOccurredAt=${historyDates.length}.`,
		);
	}

	for (let index = 0; index < historyStatusIds.length; index += 1) {
		await FreightStatusHistory.create({
			freight_id: freight.id!,
			status_id: historyStatusIds[index],
			occurred_at: historyDates[index],
		});
	}

	const proposalSpanMs = Math.max(freightUpdatedAt.getTime() - freightCreatedAt.getTime(), 60 * 60 * 1000);

	for (let proposalIndex = 0; proposalIndex < spec.proposals.length; proposalIndex += 1) {
		const proposalSpec = spec.proposals[proposalIndex]!;
		const driver_id = resolveDriverId(drivers, proposalSpec.driverIndex);
		const status_id = proposalStatusIds.get(proposalSpec.status);
		if (status_id == null) {
			throw new Error(`Status de proposta "${proposalSpec.status}" não encontrado.`);
		}

		const proposalCreatedAt = new Date(
			freightCreatedAt.getTime() +
				Math.floor((proposalSpanMs / (spec.proposals.length + 1)) * (proposalIndex + 1)),
		);

		const [, proposalCreated] = await Proposal.findOrCreate({
			where: { freight_id: freight.id!, driver_id },
			defaults: {
				freight_id: freight.id!,
				driver_id,
				status_id,
				value: proposalSpec.value,
				createdAt: proposalCreatedAt,
				updatedAt: proposalCreatedAt,
			},
		});

		await Proposal.update(
			{
				status_id,
				value: proposalSpec.value,
				createdAt: proposalCreatedAt,
				updatedAt: proposalCreatedAt,
			},
			{ where: { freight_id: freight.id!, driver_id }, silent: true },
		);

		void proposalCreated;
	}
}
