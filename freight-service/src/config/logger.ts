import { createLogger } from '@total-fretes/observability';

const serviceName = process.env.SERVICE_NAME ?? 'freight-service';

export const logger = createLogger(serviceName);
