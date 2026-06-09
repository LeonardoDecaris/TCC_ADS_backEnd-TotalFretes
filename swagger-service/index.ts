import dotenv from 'dotenv';
import { logger } from './config/logging';
import app from './src/app';

dotenv.config();

const PORT = process.env.PORT ?? 3005;

app.listen(PORT, () => {
  logger.info(`Swagger service running at http://localhost:${PORT}`);
  logger.info(`Swagger UI: http://localhost:${PORT}/swagger-ui`);
  logger.info(`Docs (JSON): http://localhost:${PORT}/docs`);
});
