import { z } from 'zod';

export const createProposalStatusTypeSchema = z.object({
	name: z.string().min(1, 'VALIDATION.NAME_REQUIRED'),
});

export const updateProposalStatusTypeSchema = createProposalStatusTypeSchema.partial();
