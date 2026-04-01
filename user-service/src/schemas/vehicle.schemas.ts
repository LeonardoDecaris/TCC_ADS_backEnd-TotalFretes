import { z } from 'zod';

export const createVehicleSchema = z.object({
	plateNumber: z.string().min(1, 'VALIDATION.PLATE_NUMBER_REQUIRED'),
	chassisNumber: z.string().optional(),
	model: z.string().optional(),
	mark: z.string().optional(),
	city: z.string().min(1, 'VALIDATION.CITY_REQUIRED'),
	stateUF: z.string().min(1, 'VALIDATION.STATE_UF_REQUIRED'),
	country: z.string().min(1, 'VALIDATION.COUNTRY_REQUIRED'),
});

export const updateVehicleSchema = createVehicleSchema.partial();
