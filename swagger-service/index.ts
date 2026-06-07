import dotenv from 'dotenv';
import app from './src/app';
import { createLogger } from '@total-fretes/observability';

dotenv.config();

const logger = createLogger(process.env.SERVICE_NAME ?? 'swagger-service');
const PORT = process.env.PORT ?? 3005;

app.listen(PORT, () => {
  logger.info(`Swagger service running at http://localhost:${PORT}`);
  logger.info(`Swagger UI: http://localhost:${PORT}/swagger-ui`);
  logger.info(`Docs (JSON): http://localhost:${PORT}/docs`);
});
