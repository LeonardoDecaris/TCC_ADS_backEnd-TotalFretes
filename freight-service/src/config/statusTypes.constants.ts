/**
 * Slugs estáveis usados nas colunas `name` de `freight_status_types` e `proposals_status_types`.
 * Ordem em seedFreightStatusTypes alinha com o domínio (ids autoincrement podem variar).
 */
export const FreightStatusSlug = {
	DISPONIVEL: 'disponivel',
	CANCELADO: 'cancelado',
	VINCULADO: 'vinculado',
	EM_TRANSITO: 'em_transito',
	EM_ROTA_ENTREGA: 'em_rota_entrega',
	ENTREGUE: 'entregue',
	CONCLUIDO: 'concluido',
} as const;

export const ProposalStatusSlug = {
	ENVIADA: 'enviada',
	RECUSADA: 'recusada',
	ACEITA: 'aceita',
} as const;

/** Nomes aceitos pelo controller ao marcar proposta como aceita (compatível com seeds e dados antigos). */
export const ACCEPTED_PROPOSAL_STATUS_NAMES: readonly string[] = [
	ProposalStatusSlug.ACEITA,
	'accepted',
	'aceito',
];
