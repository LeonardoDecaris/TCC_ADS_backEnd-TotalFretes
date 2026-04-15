import { z } from 'zod';

export const createProposalSchema = z.object({
	freight_id: z.coerce.number().int().positive('VALIDATION.FREIGHT_ID_INVALID'),
	driver_id: z.coerce.number().int().positive('VALIDATION.DRIVER_ID_INVALID'),
	status_id: z.coerce
		.number()
		.int()
		.positive('VALIDATION.PROPOSAL_STATUS_ID_INVALID')
		.optional(),
	value: z.coerce.number().nonnegative('VALIDATION.PROPOSAL_VALUE_INVALID'),
});

export const updateProposalSchema = createProposalSchema.partial();
