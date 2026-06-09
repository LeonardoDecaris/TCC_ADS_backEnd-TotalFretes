import 'dotenv/config';
import app from './app';
import { startEmailConsumer, stopEmailConsumer } from './messaging/email.consumer';
import { logger, requestIdMiddleware, requestLoggerMiddleware } from './config/logging';
import { logError } from '@total-fretes/logging';

const app = express();

app.use(express.json());
app.use(cors());
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
import { createLogger, logError } from '@total-fretes/observability';

const logger = createLogger(process.env.SERVICE_NAME ?? 'email-management-service');
const PORT = process.env.PORT || 3003;

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
