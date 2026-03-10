import { z } from 'zod';

const positiveOptionalId = (invalidMessage: string) =>
	z.preprocess(
		(value) =>
			value === '' || value === null || value === undefined ? undefined : value,
		z.coerce
			.number()
			.positive(invalidMessage)
			.optional()
	);

export const createVehicleTypeSchema = z.object({
	nome: z.string().min(1, 'VALIDATION.NOME_REQUIRED'),
	axes: z.number().positive('VALIDATION.AXES_REQUIRED'),
	weight: z.number().positive('VALIDATION.WEIGHT_REQUIRED'),
	capacityWeight: z.number().positive('VALIDATION.CAPACITY_WEIGHT_REQUIRED'),
	length: z.number().positive('VALIDATION.LENGTH_REQUIRED'),
	imageVehicle_id: positiveOptionalId('VALIDATION.IMAGE_VEHICLE_INVALID'),
	groupVehicleType_id: positiveOptionalId('VALIDATION.GROUP_VEHICLE_TYPE_INVALID'),
});

export const updateVehicleTypeSchema = createVehicleTypeSchema.partial();

