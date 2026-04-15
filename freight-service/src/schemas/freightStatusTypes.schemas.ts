import { z } from 'zod';

export const createFreightStatusTypeSchema = z.object({
	name: z.string().min(1, 'VALIDATION.NAME_REQUIRED'),
});

export const updateFreightStatusTypeSchema = createFreightStatusTypeSchema.partial();
