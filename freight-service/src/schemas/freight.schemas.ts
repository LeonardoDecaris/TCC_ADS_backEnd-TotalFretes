import { z } from 'zod';

const latSchema = z.coerce
	.number()
	.min(-90, 'VALIDATION.LAT_INVALID')
	.max(90, 'VALIDATION.LAT_INVALID');

const lngSchema = z.coerce
	.number()
	.min(-180, 'VALIDATION.LNG_INVALID')
	.max(180, 'VALIDATION.LNG_INVALID');

export const createFreightSchema = z.object({
	company_id: z.coerce.number().int().positive('VALIDATION.COMPANY_ID_INVALID'),
	cargoType_id: z.coerce.number().int().positive('VALIDATION.CARGO_TYPE_ID_INVALID'),
	origin_label: z.string().min(1, 'VALIDATION.ORIGIN_LABEL_REQUIRED'),
	origin_lat: latSchema,
	origin_lng: lngSchema,
	destination_label: z.string().min(1, 'VALIDATION.DESTINATION_LABEL_REQUIRED'),
	destination_lat: latSchema,
	destination_lng: lngSchema,
	status_id: z.coerce
		.number()
		.int()
		.positive('VALIDATION.FREIGHT_STATUS_ID_INVALID')
		.optional(),
	assignedDriver_id: z.coerce
		.number()
		.int()
		.positive('VALIDATION.DRIVER_ID_INVALID')
		.optional(),
	daysLimit: z.coerce.number().int().positive('VALIDATION.DAYS_LIMIT_INVALID').optional(),
	originalValue: z.coerce.number().nonnegative('VALIDATION.ORIGINAL_VALUE_INVALID'),
	finalValue: z.coerce.number().nonnegative('VALIDATION.FINAL_VALUE_INVALID').optional(),
});

export const updateFreightSchema = createFreightSchema.partial();
