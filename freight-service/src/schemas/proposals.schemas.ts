import { z } from 'zod';

export const createProposalSchema = z.object({
	freight_id: z.coerce.number().int().positive('VALIDATION.FREIGHT_ID_INVALID'),
	value: z.coerce.number().nonnegative('VALIDATION.PROPOSAL_VALUE_INVALID'),
});

export const updateProposalSchema = z.object({
	value: z.coerce.number().nonnegative('VALIDATION.PROPOSAL_VALUE_INVALID').optional(),
});

/** PATCH sem body: Express deixa req.body undefined; normaliza para {}. */
const emptyBodySchema = z.preprocess(
	(val) => (val === undefined || val === null ? {} : val),
	z.object({}),
);

export const acceptProposalSchema = emptyBodySchema;

export const rejectProposalSchema = emptyBodySchema;

export const proposalListQuerySchema = z.object({
	freight_id: z.coerce.number().int().positive('VALIDATION.FREIGHT_ID_INVALID').optional(),
	page: z.coerce.number().int().min(1, 'VALIDATION.PAGE_INVALID').optional(),
	limit: z.coerce.number().int().min(1, 'VALIDATION.LIMIT_INVALID').max(50, 'VALIDATION.LIMIT_MAX').optional(),
	proposal_status: z
		.enum(['enviada', 'esperando_caminhoneiro', 'aceita', 'recusada', 'nao_selecionada', 'todas'])
		.optional(),
	search: z
		.string()
		.optional()
		.transform((value) => {
			const trimmed = value?.trim();
			return trimmed && trimmed.length > 0 ? trimmed : undefined;
		}),
	status: z
		.union([z.string(), z.array(z.string())])
		.optional()
		.transform((value: string | string[] | undefined) => {
			if (!value) return undefined;
			const raw = Array.isArray(value) ? value : [value];
			const normalized = raw
				.flatMap((part) => part.split(','))
				.map((item) => item.trim().toLowerCase())
				.filter(Boolean);
			return normalized.length > 0 ? normalized : undefined;
		}),
})
	.transform((data) => ({
		...data,
		proposal_status:
			data.page != null && data.proposal_status == null ? ('enviada' as const) : data.proposal_status,
	}));

/** Query para listagem paginada de fretes com propostas agregadas (`GET /proposal/freight-summary`). */
export const proposalFreightSummaryQuerySchema = z
	.object({
		page: z.coerce.number().int().min(1, 'VALIDATION.PAGE_INVALID').optional(),
		limit: z.coerce
			.number()
			.int()
			.min(1, 'VALIDATION.LIMIT_INVALID')
			.max(50, 'VALIDATION.LIMIT_MAX')
			.optional(),
		/** `enviada` → Enviada (pendentes); `aceita` → Aceita. Recusada e Nao Selecionada nunca entram. */
		proposal_status: z.enum(['enviada', 'aceita']).optional(),
		search: z
			.string()
			.optional()
			.transform((value) => {
				const trimmed = value?.trim();
				return trimmed && trimmed.length > 0 ? trimmed : undefined;
			}),
	})
	.transform((data) => ({
		page: data.page ?? 1,
		limit: data.limit ?? 6,
		proposal_status: data.proposal_status ?? 'enviada',
		search: data.search,
	}));
