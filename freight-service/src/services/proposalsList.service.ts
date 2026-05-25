import { Op, type Includeable, type WhereOptions } from 'sequelize';
import { FreightStatusSlug, ProposalStatusSlug } from '../config/statusTypes.constants';
import CargoType from '../models/cargoTypes.model';
import Freight from '../models/freight.model';
import Proposal from '../models/proposals.model';
import ProposalStatusType from '../models/proposalsStatusTypes.model';
import FreightStatusType from '../models/freightStatusTypes.model';

export type ProposalStatusFilterSlug =
	| 'enviada'
	| 'aceita'
	| 'recusada'
	| 'nao_selecionada'
	| 'todas';

export type ProposalListSummary = {
	uniqueFreights: number;
	totalProposals: number;
	pendingProposals: number;
	acceptedProposals: number;
};

const TERMINAL_FREIGHT_STATUS_NAMES: readonly string[] = [
	FreightStatusSlug.CANCELADO,
	FreightStatusSlug.CONCLUIDO,
	FreightStatusSlug.ENTREGUE,
];

const LISTABLE_PROPOSAL_STATUS_NAMES: readonly string[] = [
	ProposalStatusSlug.ENVIADA,
	ProposalStatusSlug.ACEITA,
	ProposalStatusSlug.RECUSADA,
	ProposalStatusSlug.NAO_SELECIONADA,
];

export const mapProposalStatusFilterToDomainNames = (
	value: ProposalStatusFilterSlug | undefined
): string[] | undefined => {
	if (!value || value === 'todas') {
		return [...LISTABLE_PROPOSAL_STATUS_NAMES];
	}

	switch (value) {
		case 'aceita':
			return [ProposalStatusSlug.ACEITA];
		case 'recusada':
			return [ProposalStatusSlug.RECUSADA];
		case 'nao_selecionada':
			return [ProposalStatusSlug.NAO_SELECIONADA];
		case 'enviada':
		default:
			return [ProposalStatusSlug.ENVIADA];
	}
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

export async function fetchProposalListSummary(params: {
	companyId?: number;
	search?: string;
}): Promise<ProposalListSummary> {
	const emptySummary: ProposalListSummary = {
		uniqueFreights: 0,
		totalProposals: 0,
		pendingProposals: 0,
		acceptedProposals: 0,
	};

	const terminalIds = await getTerminalFreightStatusIds();
	const withCargo = Boolean(params.search);
	const freightWhere = buildFreightWhere(params.companyId, terminalIds, params.search);
	const freightInclude = buildFreightInclude(freightWhere, withCargo);

	const statusRows = await ProposalStatusType.findAll({
		where: { name: { [Op.in]: [...LISTABLE_PROPOSAL_STATUS_NAMES] } },
		attributes: ['id', 'name'],
	});

	if (statusRows.length === 0) {
		return emptySummary;
	}

	const statusIdByName = new Map(
		statusRows
			.filter((row) => row.id != null && row.name != null)
			.map((row) => [row.name as string, row.id as number])
	);

	const listableStatusIds = [...statusIdByName.values()];
	const enviadaStatusId = statusIdByName.get(ProposalStatusSlug.ENVIADA);
	const aceitaStatusId = statusIdByName.get(ProposalStatusSlug.ACEITA);

	const [uniqueFreights, totalProposals, pendingProposals, acceptedProposals] = await Promise.all([
		Proposal.count({
			where: { status_id: { [Op.in]: listableStatusIds } },
			include: [freightInclude],
			distinct: true,
			col: 'freight_id',
		}),
		Proposal.count({
			where: { status_id: { [Op.in]: listableStatusIds } },
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
	]);

	return {
		uniqueFreights,
		totalProposals,
		pendingProposals,
		acceptedProposals,
	};
}
