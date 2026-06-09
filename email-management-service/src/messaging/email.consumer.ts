import amqp from 'amqplib';
import type { Channel, ChannelModel, ConsumeMessage } from 'amqplib';
import { sendPasswordResetEmail } from '../services/passwordResetMail';
import { assertEmailTopology, buildEmailAmqpUri, emailAmqpConfig } from './email.amqp';
import { passwordResetEmailMessageSchema } from '@total-fretes/rpc-contracts';
import { logger } from '../config/logging';
import { logError } from '@total-fretes/logging';

let connection: ChannelModel | null = null;
let channel: Channel | null = null;
let isClosing = false;

function attachEvents(target: ChannelModel | Channel, label: string): void {
  target.on('error', (err) => logError(logger, `[email consumer] ${label} error`, err));
  target.on('close', () => {
    if (!isClosing) logger.warn(`[email consumer] ${label} closed unexpectedly`);
  });
}

async function handleMessage(msg: ConsumeMessage, ch: Channel): Promise<void> {
  let raw: unknown;

  try {
    raw = JSON.parse(msg.content.toString());
  } catch {
    ch.ack(msg);
    return;
  }

  const job = passwordResetEmailMessageSchema.safeParse(raw);
  if (!job.success) {
    ch.ack(msg);
    return;
  }

  try {
    await sendPasswordResetEmail(job.data.email, job.data.codigo);
    ch.ack(msg);
  } catch (err) {
    logError(logger, '[email consumer] failed to send email', err);
    ch.nack(msg, false, false);
  }
}

async function connectWithRetry(maxAttempts = 30, delayMs = 2000): Promise<ChannelModel> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await amqp.connect(buildEmailAmqpUri(), {
        clientProperties: { connection_name: 'email-management-service-consumer' },
      });
    } catch (err) {
      lastError = err;
      if (attempt === maxAttempts) break;
      logger.warn(
        `[email consumer] RabbitMQ indisponível (tentativa ${attempt}/${maxAttempts}), nova tentativa em ${delayMs}ms...`,
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

export async function startEmailConsumer(): Promise<void> {
  connection = await connectWithRetry();
  attachEvents(connection, 'connection');

  const ch = await connection.createChannel();
  channel = ch;
  attachEvents(ch, 'channel');

  await ch.prefetch(1);
  await assertEmailTopology(ch);

  const { queue } = emailAmqpConfig();

  await ch.consume(
    queue,
    (msg) => {
      if (!msg) return;
      void handleMessage(msg, ch);
    },
    { noAck: false },
  );

  logger.info(`[email consumer] listening on queue "${queue}"`);
}

export async function stopEmailConsumer(): Promise<void> {
  isClosing = true;
  try { await channel?.close(); } catch { /* ignore */ }
  try { await connection?.close(); } catch { /* ignore */ }
  channel = null;
  connection = null;
  isClosing = false;
}
