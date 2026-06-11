import { z } from 'zod';

const normalizeVehiclePayload = (input: unknown) => {
	if (!input || typeof input !== 'object') return input;

	const data = { ...(input as Record<string, unknown>) };

	if (data.plate && !data.plateNumber) {
		data.plateNumber = data.plate;
	}

	if (data.state && !data.stateUF) {
		data.stateUF = data.state;
	}

	return data;
};

const baseVehicleSchema = z.object({
	plateNumber: z.string().min(1, 'VALIDATION.PLATE_NUMBER_REQUIRED'),
	chassisNumber: z.string().optional(),
	model: z.string().optional(),
	mark: z.string().optional(),
	city: z.string().min(1, 'VALIDATION.CITY_REQUIRED'),
	stateUF: z.string().min(1, 'VALIDATION.STATE_UF_REQUIRED'),
	country: z.string().min(1, 'VALIDATION.COUNTRY_REQUIRED'),
	vehicleType_id: z.number().positive({ message: 'VALIDATION.VEHICLE_TYPE_INVALID' }),
});

export const createVehicleSchema = z.preprocess(normalizeVehiclePayload, baseVehicleSchema);

export const updateVehicleSchema = z.preprocess(
	normalizeVehiclePayload,
	baseVehicleSchema.partial(),
);
