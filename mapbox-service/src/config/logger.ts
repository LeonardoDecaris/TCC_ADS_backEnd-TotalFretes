import { createLogger } from '@total-fretes/observability';

export const logger = createLogger(process.env.SERVICE_NAME ?? 'mapbox-service');
