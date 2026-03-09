import { z } from 'zod';

export const createCnhTypeSchema = z.object({
	name: z.string().min(1, 'VALIDATION.NAME_REQUIRED'),
	description: z.string().min(1, 'VALIDATION.DESCRIPTION_REQUIRED'),
});

export const updateCnhTypeSchema = createCnhTypeSchema.partial();
