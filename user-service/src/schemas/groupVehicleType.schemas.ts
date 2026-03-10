import { z } from 'zod';

export const createGroupVehicleTypeSchema = z.object({
	nome: z.string().min(1, 'VALIDATION.NOME_REQUIRED'),
	cnhType_id: z.coerce
		.number({ error: 'VALIDATION.CNH_TYPE_REQUIRED' })
		.positive('VALIDATION.CNH_TYPE_INVALID'),
});

export const updateGroupVehicleTypeSchema = createGroupVehicleTypeSchema.partial();

