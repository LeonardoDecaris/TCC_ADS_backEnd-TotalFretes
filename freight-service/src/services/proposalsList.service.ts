import { Op, type Includeable, type WhereOptions } from 'sequelize';
import { FreightStatusSlug, ProposalStatusSlug } from '../config/statusTypes.constants';
import CargoType from '../models/cargoTypes.model';
import Freight from '../models/freight.model';
import Proposal from '../models/proposals.model';
import ProposalStatusType from '../models/proposalsStatusTypes.model';
import FreightStatusType from '../models/freightStatusTypes.model';

export type ProposalStatusFilterSlug =
	| 'enviada'
	| 'esperando_caminhoneiro'
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
	ProposalStatusSlug.ESPERANDO_CAMINHONEIRO,
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
			return [ProposalStatusSlug.ACEITA, ProposalStatusSlug.ESPERANDO_CAMINHONEIRO];
		case 'esperando_caminhoneiro':
			return [ProposalStatusSlug.ESPERANDO_CAMINHONEIRO];
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

export const buildFreightWhere = (
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

function normalizeProposalStatusKey(name: string): string {
	return name
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '_');
}

function resolveStatusId(statusIdByKey: Map<string, number>, ...aliases: string[]): number | undefined {
	for (const alias of aliases) {
		const id = statusIdByKey.get(normalizeProposalStatusKey(alias));
		if (id != null) return id;
	}
	return undefined;
}

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

	// Alinha com a listagem paginada: conta propostas de todos os fretes da empresa (sem excluir finalizados).
	const withCargo = Boolean(params.search);
	const freightWhere = buildFreightWhere(params.companyId, [], params.search);
	const freightInclude = buildFreightInclude(freightWhere, withCargo);

	const statusRows = await ProposalStatusType.findAll({
		attributes: ['id', 'name'],
	});

	if (statusRows.length === 0) {
		return emptySummary;
	}

	const statusIdByKey = new Map<string, number>();
	for (const row of statusRows) {
		if (row.id != null && row.name) {
			statusIdByKey.set(normalizeProposalStatusKey(row.name), row.id);
		}
	}

	const listableStatusIds = LISTABLE_PROPOSAL_STATUS_NAMES.map((name) =>
		resolveStatusId(statusIdByKey, name)
	).filter((id): id is number => id != null);

	if (listableStatusIds.length === 0) {
		return emptySummary;
	}

	const enviadaStatusId = resolveStatusId(statusIdByKey, ProposalStatusSlug.ENVIADA, 'enviada');
	const acceptedStatusIds = [
		resolveStatusId(statusIdByKey, ProposalStatusSlug.ACEITA, 'aceita', 'accepted', 'aceito'),
		resolveStatusId(
			statusIdByKey,
			ProposalStatusSlug.ESPERANDO_CAMINHONEIRO,
			'esperando_caminhoneiro'
		),
	].filter((id): id is number => id != null);
	const uniqueAcceptedStatusIds = [...new Set(acceptedStatusIds)];

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
		uniqueAcceptedStatusIds.length > 0
			? Proposal.count({
					where: { status_id: { [Op.in]: uniqueAcceptedStatusIds } },
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
