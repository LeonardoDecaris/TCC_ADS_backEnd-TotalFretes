import type { z } from 'zod';

export type ParseRpcPayloadResult<T> =
  | { success: true; data: T }
  | { success: false };

export function parseRpcPayload<T>(
  schema: z.ZodType<T>,
  raw: unknown,
): ParseRpcPayloadResult<T> {
  const result = schema.safeParse(raw);
  if (result.success) return { success: true, data: result.data };
  return { success: false };
}
