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
	cargoType_id: z.coerce.number().int().positive('VALIDATION.CARGO_TYPE_ID_INVALID'),
	name: z.string().trim().min(1, 'VALIDATION.FREIGHT_NAME_REQUIRED').max(255, 'VALIDATION.FREIGHT_NAME_MAX'),
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
	company_id: z.coerce
		.number()
		.int()
		.positive('VALIDATION.COMPANY_ID_INVALID')
		.optional(),
	daysLimit: z.coerce.number().int().positive('VALIDATION.DAYS_LIMIT_INVALID').optional(),
	originalValue: z.coerce.number().nonnegative('VALIDATION.ORIGINAL_VALUE_INVALID'),
	weight: z.coerce.number().positive('VALIDATION.WEIGHT_INVALID'),
});

/** Query string para listagem paginada de fretes (`GET /freight?page=&limit=`). */
export const freightListPaginatedQuerySchema = z
	.object({
		page: z.coerce.number().int().min(1, 'VALIDATION.PAGE_INVALID'),
		limit: z.coerce
			.number()
			.int()
			.min(1, 'VALIDATION.LIMIT_INVALID')
			.max(50, 'VALIDATION.LIMIT_MAX')
			.optional(),
	})
	.transform((data) => ({
		page: data.page,
		limit: data.limit ?? 20,
	}));

export const updateFreightSchema = z.object({
	cargoType_id: z.coerce.number().int().positive('VALIDATION.CARGO_TYPE_ID_INVALID').optional(),
	name: z.string().trim().min(1, 'VALIDATION.FREIGHT_NAME_REQUIRED').max(255, 'VALIDATION.FREIGHT_NAME_MAX').optional(),
	origin_label: z.string().min(1, 'VALIDATION.ORIGIN_LABEL_REQUIRED').optional(),
	origin_lat: latSchema.optional(),
	origin_lng: lngSchema.optional(),
	destination_label: z.string().min(1, 'VALIDATION.DESTINATION_LABEL_REQUIRED').optional(),
	destination_lat: latSchema.optional(),
	destination_lng: lngSchema.optional(),
	status_id: z.coerce
		.number()
		.int()
		.positive('VALIDATION.FREIGHT_STATUS_ID_INVALID')
		.optional(),
	daysLimit: z.coerce.number().int().positive('VALIDATION.DAYS_LIMIT_INVALID').optional(),
	originalValue: z.coerce.number().nonnegative('VALIDATION.ORIGINAL_VALUE_INVALID').optional(),
	weight: z.coerce.number().positive('VALIDATION.WEIGHT_INVALID').optional(),
});
