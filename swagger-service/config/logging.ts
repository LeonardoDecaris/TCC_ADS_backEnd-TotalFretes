import { createServiceLogging } from '@total-fretes/logging';

export const { logger, requestIdMiddleware, requestLoggerMiddleware } = createServiceLogging(
  process.env.SERVICE_NAME ?? 'swagger-service',
);
