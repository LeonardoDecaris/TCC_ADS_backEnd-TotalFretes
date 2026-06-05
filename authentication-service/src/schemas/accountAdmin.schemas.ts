import { z } from 'zod';

export const accountListQuerySchema = z.object({
	page: z.coerce.number().int().min(1).optional().default(1),
	limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const accountPatchSchema = z.object({
	email: z.string().trim().email().optional(),
	account_type_id: z.coerce.number().int().positive().optional(),
}).refine((data) => data.email !== undefined || data.account_type_id !== undefined, {
	message: 'VALIDATION.ACCOUNT_PATCH_EMPTY',
});

export const subjectIdParamSchema = z.object({
	subjectId: z.coerce.number().int().positive(),
});

export const accountAdminCreateSchema = z.object({
	email: z.string().trim().email(),
	password: z.string().min(8),
});
