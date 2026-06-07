import { z } from 'zod';

export const ingestLocationSchema = z.object({
  freightId: z.coerce.number().int().positive(),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  speed: z.coerce.number().min(0).nullable().optional(),
  heading: z.coerce.number().min(0).max(360).nullable().optional(),
  recordedAt: z.string().min(1).optional(),
});

export const trailParamsSchema = z.object({
  freightId: z.coerce.number().int().positive(),
});

export type IngestLocationInput = z.infer<typeof ingestLocationSchema>;
