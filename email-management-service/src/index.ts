import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { startEmailConsumer, closeEmailConsumer } from './messaging/email.consumer';

const app = express();

app.use(express.json());
app.use(cors());

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;

async function shutdown(signal: string) {
  console.info(`${signal} received, shutting down`);
  try {
    await closeEmailConsumer();
  } catch (e) {
    console.error('Erro ao encerrar RabbitMQ:', e);
  }
  process.exit(0);
}

(async () => {
  await startEmailConsumer();
  app.listen(PORT, () => {
    console.log(`Microsserviço de e-mail na porta ${PORT} (consumidor RabbitMQ ativo)`);
  });
  process.once('SIGTERM', () => {
    void shutdown('SIGTERM');
  });
  process.once('SIGINT', () => {
    void shutdown('SIGINT');
  });
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
