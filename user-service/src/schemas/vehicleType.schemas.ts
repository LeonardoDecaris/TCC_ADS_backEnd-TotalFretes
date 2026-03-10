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
	axes: z.string().min(1, 'VALIDATION.AXES_REQUIRED'),
	weight: z.string().min(1, 'VALIDATION.WEIGHT_REQUIRED'),
	capacityWeight: z.string().min(1, 'VALIDATION.CAPACITY_WEIGHT_REQUIRED'),
	length: z.string().min(1, 'VALIDATION.LENGTH_REQUIRED'),
	imageVehicle_id: positiveOptionalId('VALIDATION.IMAGE_VEHICLE_INVALID'),
	groupVehicleType_id: positiveOptionalId('VALIDATION.GROUP_VEHICLE_TYPE_INVALID'),
});

export const updateVehicleTypeSchema = createVehicleTypeSchema.partial();

