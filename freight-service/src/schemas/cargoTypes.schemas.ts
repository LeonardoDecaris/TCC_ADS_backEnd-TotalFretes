import { z } from 'zod';

export const createCargoTypeSchema = z.object({
	name: z.string().min(1, 'VALIDATION.NAME_REQUIRED'),
	weight: z.coerce.number().optional(),
	vehicleType: z.string().min(1, 'VALIDATION.VEHICLE_TYPE_REQUIRED'),
	imageCargo_id: z.coerce
		.number()
		.int()
		.positive('VALIDATION.IMAGE_CARGO_ID_INVALID')
		.optional(),
});

export const updateCargoTypeSchema = createCargoTypeSchema.partial();
