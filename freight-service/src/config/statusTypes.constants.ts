/**
 * Slugs estáveis usados nas colunas `name` de `freight_status_types` e `proposals_status_types`.
 * Ordem em seedFreightStatusTypes alinha com o domínio (ids autoincrement podem variar).
 */
export const FreightStatusSlug = {
	DISPONIVEL: 'Disponivel',
	CANCELADO: 'Cancelado',
	VINCULADO: 'Vinculado',
	EM_TRANSITO: 'Em Transito',
	EM_ROTA_ENTREGA: 'Em Rota de Entrega',
	ENTREGUE: 'Entregue',
	CONCLUIDO: 'Concluido',
} as const;

export const ProposalStatusSlug = {
	ENVIADA: 'Enviada',
	RECUSADA: 'Recusada',
	ACEITA: 'Aceita',
	NAO_SELECIONADA: 'Nao Selecionada',
} as const;

/** Nomes aceitos pelo controller ao marcar proposta como aceita (compatível com seeds e dados antigos). */
export const ACCEPTED_PROPOSAL_STATUS_NAMES: readonly string[] = [
	ProposalStatusSlug.ACEITA,
	'accepted',
	'aceito',
];
