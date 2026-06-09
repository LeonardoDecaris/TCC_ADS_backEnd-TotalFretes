import type winston from 'winston';
import { getErrorOrigin } from './getErrorOrigin';

type LogMeta = Record<string, unknown>;

export function logError(
  logger: winston.Logger,
  message: string,
  error: unknown,
  meta: LogMeta = {},
): void {
  const origin = getErrorOrigin(error);
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  logger.error(message, {
    ...meta,
    errorMessage,
    stack,
    file: origin?.file,
    line: origin?.line,
  });
}
