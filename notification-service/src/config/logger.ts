import winston from 'winston';
import LokiTransport from 'winston-loki';

const DEFAULT_LOKI_HOST = 'http://loki:3100';
let lokiConnectionWarningShown = false;

function readBooleanEnv(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined || value.trim() === '') return defaultValue;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

export function createLogger(serviceName: string): winston.Logger {
  const level = process.env.LOG_LEVEL ?? 'info';
  const lokiHost = process.env.LOKI_HOST ?? DEFAULT_LOKI_HOST;
  const logToLoki = readBooleanEnv(process.env.LOG_TO_LOKI, true);

  const transports: winston.transport[] = [
    new winston.transports.Console({
      handleExceptions: true,
      handleRejections: true,
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ];

  if (logToLoki) {
    transports.push(
      new LokiTransport({
        host: lokiHost,
        labels: { service: serviceName },
        json: true,
        format: winston.format.combine(),
        replaceTimestamp: true,
        onConnectionError: (err: unknown) => {
          if (lokiConnectionWarningShown) return;
          lokiConnectionWarningShown = true;
          const message = err instanceof Error ? err.message : String(err);
          console.warn(`[loki] unable to send logs to ${lokiHost}: ${message}`);
        },
      }),
    );
  }

  return winston.createLogger({
    level,
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    defaultMeta: {
      service: serviceName,
      environment: process.env.NODE_ENV ?? 'development',
    },
    transports,
  });
}

export const logger = createLogger(process.env.SERVICE_NAME ?? 'notification-service');
