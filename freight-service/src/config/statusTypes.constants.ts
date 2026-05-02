/**
 * Slugs estáveis usados nas colunas `name` de `freight_status_types` e `proposals_status_types`.
 * Mantém o código e as seeds alinhados para testes e para o fluxo de aceite de proposta.
 */
export const FreightStatusSlug = {
	OPEN: 'open',
	ASSIGNED: 'assigned',
	IN_TRANSIT: 'in_transit',
	DELIVERED: 'delivered',
	CANCELLED: 'cancelled',
} as const;

export const ProposalStatusSlug = {
	PENDING: 'pending',
	ACCEPTED: 'accepted',
	REJECTED: 'rejected',
	WITHDRAWN: 'withdrawn',
} as const;

/** Nomes aceitos pelo controller ao marcar proposta como aceita (compatível com seeds e dados antigos). */
export const ACCEPTED_PROPOSAL_STATUS_NAMES: readonly string[] = [
	ProposalStatusSlug.ACCEPTED,
	'aceita',
	'aceito',
];
