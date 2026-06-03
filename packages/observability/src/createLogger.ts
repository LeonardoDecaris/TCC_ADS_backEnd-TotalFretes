import winston from 'winston';
import LokiTransport from 'winston-loki';
import { getErrorOrigin } from './getErrorOrigin';

export function createLogger(serviceName: string): winston.Logger {
  const level = process.env.LOG_LEVEL ?? 'info';
  const lokiHost = process.env.LOKI_HOST ?? 'http://loki:3100';

  return winston.createLogger({
    level,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    ),
    defaultMeta: { service: serviceName },
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple(),
        ),
      }),
      new LokiTransport({
        host: lokiHost,
        labels: { service: serviceName },
        json: true,
        format: winston.format.combine(),
        replaceTimestamp: true,
        onConnectionError: (err) => console.error('[loki]', err),
      }),
    ],
  });
}

export function logError(
  logger: winston.Logger,
  message: string,
  error: unknown,
  meta: Record<string, unknown> = {},
): void {
  const origin = getErrorOrigin(error);
  const errMessage = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  logger.error(message, {
    ...meta,
    errorMessage: errMessage,
    stack,
    file: origin?.file,
    line: origin?.line,
  });
}
