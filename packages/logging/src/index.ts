import { createLogger } from './logger';
import { requestIdMiddleware, createRequestLoggerMiddleware } from './middlewares';

export { logError } from './logError';
export { getErrorOrigin } from './getErrorOrigin';
export {
  REQUEST_ID_HEADER,
  requestContext,
  createErrorId,
  resolveRequestId,
  getRequestId,
  getActiveRequestId,
} from './correlation';
export { createLogger } from './logger';
export { requestIdMiddleware, createRequestLoggerMiddleware } from './middlewares';

export function createServiceLogging(serviceName: string) {
  const logger = createLogger(serviceName);
  return {
    logger,
    requestIdMiddleware,
    requestLoggerMiddleware: createRequestLoggerMiddleware(logger),
  };
}
