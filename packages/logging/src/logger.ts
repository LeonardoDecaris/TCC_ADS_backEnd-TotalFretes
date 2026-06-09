import winston from 'winston';

const isDev = (process.env.NODE_ENV ?? 'development') === 'development';

export function createLogger(serviceName: string): winston.Logger {
  const level = process.env.LOG_LEVEL ?? 'info';

  const consoleFormat = isDev
    ? winston.format.combine(winston.format.colorize(), winston.format.simple())
    : winston.format.combine(winston.format.timestamp(), winston.format.json());

  return winston.createLogger({
    level,
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    defaultMeta: {
      service: serviceName,
      environment: process.env.NODE_ENV ?? 'development',
    },
    transports: [
      new winston.transports.Console({
        handleExceptions: true,
        handleRejections: true,
        format: consoleFormat,
      }),
    ],
  });
}
