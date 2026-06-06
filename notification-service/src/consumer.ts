import amqp from 'amqplib';
import type { Channel, ChannelModel, ConsumeMessage } from 'amqplib';
import { z } from 'zod';
import { notifyUser } from './clients';
import { logger } from './config/logger';
import {
  assertNotificationsTopology,
  buildNotificationsAmqpUri,
  notificationsAmqpConfig,
} from './messaging/notifications.amqp';
import { saveNotification, toNotificationPayload } from './services/notification.service';

const notificationMessageSchema = z.object({
  userId: z.number().int().positive(),
  type: z.string().min(1).max(64),
  title: z.string().min(1).max(255),
  body: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

let connection: ChannelModel | null = null;
let channel: Channel | null = null;
let isClosing = false;

function attachEvents(target: ChannelModel | Channel, label: string): void {
  target.on('error', (err) => logger.error(`[notification consumer] ${label} error`, { err }));
  target.on('close', () => {
    if (!isClosing) {
      logger.warn(`[notification consumer] ${label} closed unexpectedly`);
    }
  });
}

async function handleMessage(msg: ConsumeMessage, ch: Channel): Promise<void> {
  let raw: unknown;

  try {
    raw = JSON.parse(msg.content.toString());
  } catch {
    logger.warn('[notification consumer] invalid JSON, discarding message');
    ch.ack(msg);
    return;
  }

  const parsed = notificationMessageSchema.safeParse(raw);
  if (!parsed.success) {
    logger.warn('[notification consumer] invalid payload schema', { issues: parsed.error.issues });
    ch.ack(msg);
    return;
  }

  const { userId, type, title, body, metadata } = parsed.data;

  try {
    const saved = await saveNotification({
      user_id: userId,
      type,
      title,
      body,
      metadata: metadata ?? null,
    });

    const payload = toNotificationPayload(saved);

    logger.info('[notification consumer] message consumed', {
      userId,
      type,
      notificationId: payload.id,
    });

    notifyUser(userId, {
      event: 'NEW_NOTIFICATION',
      data: payload,
    });

    ch.ack(msg);
  } catch (err) {
    logger.error('[notification consumer] failed to process message', {
      userId,
      type,
      err,
    });
    ch.nack(msg, false, false);
  }
}

async function connectWithRetry(maxAttempts = 30, delayMs = 2000): Promise<ChannelModel> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await amqp.connect(buildNotificationsAmqpUri(), {
        clientProperties: { connection_name: 'notification-service-consumer' },
      });
    } catch (err) {
      lastError = err;
      if (attempt === maxAttempts) break;
      logger.warn('[notification consumer] RabbitMQ unavailable, retrying', {
        attempt,
        maxAttempts,
        delayMs,
      });
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

export async function startNotificationConsumer(): Promise<void> {
  connection = await connectWithRetry();
  attachEvents(connection, 'connection');

  const ch = await connection.createChannel();
  channel = ch;
  attachEvents(ch, 'channel');

  await ch.prefetch(1);
  await assertNotificationsTopology(ch);

  const { queue } = notificationsAmqpConfig();

  await ch.consume(
    queue,
    (msg) => {
      if (!msg) return;
      void handleMessage(msg, ch);
    },
    { noAck: false },
  );

  logger.info(`[notification consumer] listening on queue "${queue}"`);
}

export async function stopNotificationConsumer(): Promise<void> {
  isClosing = true;
  try {
    await channel?.close();
  } catch {
    /* ignore */
  }
  try {
    await connection?.close();
  } catch {
    /* ignore */
  }
  channel = null;
  connection = null;
  isClosing = false;
}
