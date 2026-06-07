import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { startEmailConsumer, stopEmailConsumer } from './messaging/email.consumer';
import { logger } from './config/logger';
import { logError } from './utils/logError';
import { requestIdMiddleware } from './middlewares/requestId';
import { requestLoggerMiddleware } from './middlewares/requestLogger';

const app = express();

app.use(express.json());
app.use(cors());
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;

async function shutdown(signal: string) {
  logger.info(`${signal} received, shutting down`);
  try {
    await stopEmailConsumer();
  } catch (e) {
    logError(logger, 'Erro ao encerrar RabbitMQ', e);
  }
  process.exit(0);
}

(async () => {
  await startEmailConsumer();
  app.listen(PORT, () => {
    logger.info(`Microsserviço de e-mail na porta ${PORT} (consumidor RabbitMQ ativo)`);
  });
  process.once('SIGTERM', () => {
    void shutdown('SIGTERM');
  });
  process.once('SIGINT', () => {
    void shutdown('SIGINT');
  });
})().catch((err) => {
  logError(logger, 'Falha ao iniciar email-management-service', err);
  process.exit(1);
});
