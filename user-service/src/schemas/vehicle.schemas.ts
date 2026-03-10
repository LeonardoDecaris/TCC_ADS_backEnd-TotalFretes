import { z } from 'zod';

export const createVehicleSchema = z.object({
	plateNumber: z.string().min(1, 'VALIDATION.PLATE_NUMBER_REQUIRED'),
	chassisNumber: z.string().min(1, 'VALIDATION.CHASSIS_NUMBER_REQUIRED'),
	city: z.string().min(1, 'VALIDATION.CITY_REQUIRED'),
	stateUF: z.string().min(1, 'VALIDATION.STATE_UF_REQUIRED'),
	country: z.string().min(1, 'VALIDATION.COUNTRY_REQUIRED'),
	vehicleType_id: z.coerce
		.number({ error: 'VALIDATION.VEHICLE_TYPE_REQUIRED' })
		.positive('VALIDATION.VEHICLE_TYPE_INVALID'),
});

export const updateVehicleSchema = createVehicleSchema.partial();

