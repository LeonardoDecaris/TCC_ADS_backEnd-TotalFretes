import { z } from 'zod';

export const createProposalSchema = z.object({
	freight_id: z.coerce.number().int().positive('VALIDATION.FREIGHT_ID_INVALID'),
	value: z.coerce.number().nonnegative('VALIDATION.PROPOSAL_VALUE_INVALID'),
});

export const updateProposalSchema = z.object({
	value: z.coerce.number().nonnegative('VALIDATION.PROPOSAL_VALUE_INVALID').optional(),
});

export const acceptProposalSchema = z.object({});
