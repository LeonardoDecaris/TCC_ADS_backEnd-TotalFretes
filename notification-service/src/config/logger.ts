import { createLogger } from '@total-fretes/observability';

const serviceName = process.env.SERVICE_NAME ?? 'notification-service';

export const logger = createLogger(serviceName);
