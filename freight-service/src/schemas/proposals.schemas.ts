import { z } from 'zod';

export const createProposalSchema = z.object({
	freight_id: z.coerce.number().int().positive('VALIDATION.FREIGHT_ID_INVALID'),
	value: z.coerce.number().nonnegative('VALIDATION.PROPOSAL_VALUE_INVALID'),
});

export const updateProposalSchema = z.object({
	value: z.coerce.number().nonnegative('VALIDATION.PROPOSAL_VALUE_INVALID').optional(),
});

export const acceptProposalSchema = z.object({});

export const rejectProposalSchema = z.object({});

export const proposalListQuerySchema = z.object({
	freight_id: z.coerce.number().int().positive('VALIDATION.FREIGHT_ID_INVALID').optional(),
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
});
