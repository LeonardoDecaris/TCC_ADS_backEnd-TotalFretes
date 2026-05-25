import { Op, type Includeable, type WhereOptions } from 'sequelize';
import sequelize from '../config/database';
import { FreightStatusSlug, ProposalStatusSlug } from '../config/statusTypes.constants';
import CargoType from '../models/cargoTypes.model';
import Freight from '../models/freight.model';
import Proposal from '../models/proposals.model';
import ProposalStatusType from '../models/proposalsStatusTypes.model';
import FreightStatusType from '../models/freightStatusTypes.model';

const TERMINAL_FREIGHT_STATUS_NAMES: readonly string[] = [
	FreightStatusSlug.CANCELADO,
	FreightStatusSlug.CONCLUIDO,
	FreightStatusSlug.ENTREGUE,
];

export type ProposalFreightSummaryQuery = {
	page: number;
	limit: number;
	proposal_status: 'enviada' | 'aceita';
	search?: string;
};

export type ProposalFreightSummaryResult = {
	items: Array<{
		freight: ReturnType<typeof normalizeFreightForResponse>;
		proposalCount: number;
		pendingCount: number;
		bestValue: number;
		averageValue: number;
		referenceValue: number;
	}>;
	total: number;
	page: number;
	limit: number;
	hasMore: boolean;
	summary: {
		freightsWithProposals: number;
		totalProposals: number;
		pendingProposals: number;
		acceptedProposals: number;
		freightsInNegotiation: number;
	};
};

const normalizeFreightForResponse = (freight: Freight) => {
	const json = freight.toJSON() as Record<string, unknown>;
	return {
		...json,
		CargoType: (json.cargo as object | undefined) ?? json.CargoType,
		FreightStatusType: (json.status as object | undefined) ?? json.FreightStatusType,
	};
};

const getTerminalFreightStatusIds = async (): Promise<number[]> => {
	const rows = await FreightStatusType.findAll({
		where: { name: { [Op.in]: [...TERMINAL_FREIGHT_STATUS_NAMES] } },
		attributes: ['id'],
	});
	return rows.map((row) => row.id).filter((id): id is number => id != null);
};

const buildFreightWhere = (
	companyId: number | undefined,
	terminalIds: number[],
	search?: string
): WhereOptions => {
	const parts: WhereOptions[] = [];

	if (companyId != null) {
		parts.push({ company_id: companyId });
	}

	if (terminalIds.length > 0) {
		parts.push({
			[Op.or]: [{ status_id: null }, { status_id: { [Op.notIn]: terminalIds } }],
		});
	}

	if (search) {
		const term = `%${search}%`;
		parts.push({
			[Op.or]: [
				{ name: { [Op.like]: term } },
				{ origin_label: { [Op.like]: term } },
				{ destination_label: { [Op.like]: term } },
				{ '$cargo.name$': { [Op.like]: term } },
			],
		});
	}

	if (parts.length === 0) return {};
	if (parts.length === 1) return parts[0];
	return { [Op.and]: parts };
};

const buildFreightInclude = (freightWhere: WhereOptions, withCargo: boolean): Includeable => ({
	model: Freight,
	required: true,
	attributes: [],
	where: freightWhere,
	...(withCargo
		? {
				include: [
					{
						model: CargoType,
						as: 'cargo',
						required: false,
						attributes: [],
					},
				],
			}
		: {}),
});

type AggregateRow = {
	freight_id: number;
	proposalCount: string | number;
	bestValue: string | number;
	averageValue: string | number;
};

type PendingCountRow = {
	freight_id: number;
	pendingCount: string | number;
};

export async function fetchProposalFreightSummary(
	params: ProposalFreightSummaryQuery & { companyId?: number }
): Promise<ProposalFreightSummaryResult> {
	const emptySummary = {
		freightsWithProposals: 0,
		totalProposals: 0,
		pendingProposals: 0,
		acceptedProposals: 0,
		freightsInNegotiation: 0,
	};

	const proposalStatusName =
		params.proposal_status === 'aceita' ? ProposalStatusSlug.ACEITA : ProposalStatusSlug.ENVIADA;

	const [proposalStatus, enviadaStatus, aceitaStatus, vinculadoStatus, terminalIds] =
		await Promise.all([
			ProposalStatusType.findOne({
				where: { name: proposalStatusName },
				attributes: ['id'],
			}),
			ProposalStatusType.findOne({
				where: { name: ProposalStatusSlug.ENVIADA },
				attributes: ['id'],
			}),
			ProposalStatusType.findOne({
				where: { name: ProposalStatusSlug.ACEITA },
				attributes: ['id'],
			}),
			FreightStatusType.findOne({
				where: { name: FreightStatusSlug.VINCULADO },
				attributes: ['id'],
			}),
			getTerminalFreightStatusIds(),
		]);

	const proposalStatusId = proposalStatus?.id;
	const enviadaStatusId = enviadaStatus?.id ?? null;
	const aceitaStatusId = aceitaStatus?.id ?? null;
	const vinculadoStatusId = vinculadoStatus?.id ?? null;

	if (proposalStatusId == null) {
		return {
			items: [],
			total: 0,
			page: params.page,
			limit: params.limit,
			hasMore: false,
			summary: emptySummary,
		};
	}

	const withCargo = Boolean(params.search?.trim());
	const freightWhere = buildFreightWhere(params.companyId, terminalIds, params.search);
	const freightInclude = buildFreightInclude(freightWhere, withCargo);

	const proposalFilterWhere: WhereOptions = { status_id: proposalStatusId };

	const offset = (params.page - 1) * params.limit;

	const [total, aggregateRows, summaryTotalProposals, summaryPending, summaryAccepted, freightsInNegotiation] =
		await Promise.all([
			Proposal.count({
				where: proposalFilterWhere,
				include: [freightInclude],
				distinct: true,
				col: 'freight_id',
			}),
			Proposal.findAll({
				attributes: [
					'freight_id',
					[sequelize.fn('COUNT', sequelize.col('Proposal.id')), 'proposalCount'],
					[sequelize.fn('MIN', sequelize.col('Proposal.value')), 'bestValue'],
					[sequelize.fn('AVG', sequelize.col('Proposal.value')), 'averageValue'],
				],
				where: proposalFilterWhere,
				include: [freightInclude],
				group: ['freight_id'],
				order: [[sequelize.fn('MAX', sequelize.col('Proposal.createdAt')), 'DESC']],
				limit: params.limit,
				offset,
				subQuery: false,
				raw: true,
			}) as unknown as Promise<AggregateRow[]>,
			Proposal.count({
				where: proposalFilterWhere,
				include: [freightInclude],
			}),
			enviadaStatusId != null
				? Proposal.count({
						where: { status_id: enviadaStatusId },
						include: [freightInclude],
					})
				: Promise.resolve(0),
			aceitaStatusId != null
				? Proposal.count({
						where: { status_id: aceitaStatusId },
						include: [freightInclude],
					})
				: Promise.resolve(0),
			vinculadoStatusId != null
				? Freight.count({
						where: {
							[Op.and]: [freightWhere, { status_id: vinculadoStatusId }],
						},
						...(withCargo
							? {
									include: [
										{
											model: CargoType,
											as: 'cargo',
											required: false,
											attributes: [],
										},
									],
								}
							: {}),
					})
				: Promise.resolve(0),
		]);

	const freightIds = aggregateRows.map((row) => row.freight_id);

	const pendingByFreightId = new Map<number, number>();
	if (freightIds.length > 0 && enviadaStatusId != null) {
		const pendingRows = (await Proposal.findAll({
			attributes: [
				'freight_id',
				[sequelize.fn('COUNT', sequelize.col('Proposal.id')), 'pendingCount'],
			],
			where: {
				freight_id: { [Op.in]: freightIds },
				status_id: enviadaStatusId,
			},
			group: ['freight_id'],
			raw: true,
		})) as unknown as PendingCountRow[];

		for (const row of pendingRows) {
			pendingByFreightId.set(row.freight_id, Number(row.pendingCount));
		}
	}

	const freights =
		freightIds.length > 0
			? await Freight.findAll({
					where: { id: { [Op.in]: freightIds } },
					include: [
						{ model: CargoType, as: 'cargo', required: false },
						{ model: FreightStatusType, as: 'status', required: false },
					],
				})
			: [];

	const freightById = new Map(freights.map((freight) => [freight.id, freight]));

	const items = aggregateRows
		.map((row) => {
			const freight = freightById.get(row.freight_id);
			if (!freight) return null;

			const referenceValue = freight.finalValue ?? freight.originalValue ?? 0;

			return {
				freight: normalizeFreightForResponse(freight),
				proposalCount: Number(row.proposalCount),
				pendingCount: pendingByFreightId.get(row.freight_id) ?? 0,
				bestValue: Number(row.bestValue),
				averageValue: Number(row.averageValue),
				referenceValue: Number(referenceValue),
			};
		})
		.filter((item): item is NonNullable<typeof item> => item != null);

	const hasMore = params.page * params.limit < total;

	return {
		items,
		total,
		page: params.page,
		limit: params.limit,
		hasMore,
		summary: {
			freightsWithProposals: total,
			totalProposals: summaryTotalProposals,
			pendingProposals: summaryPending,
			acceptedProposals: summaryAccepted,
			freightsInNegotiation,
		},
	};
}
