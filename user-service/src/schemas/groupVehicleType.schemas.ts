import { z } from 'zod';

export const createGroupVehicleTypeSchema = z.object({
	nome: z.string().min(1, 'VALIDATION.NOME_REQUIRED'),
	cnhType_id: z.number().min(1, 'VALIDATION.CNH_TYPE_REQUIRED'),
});

export const updateGroupVehicleTypeSchema = createGroupVehicleTypeSchema.partial();

