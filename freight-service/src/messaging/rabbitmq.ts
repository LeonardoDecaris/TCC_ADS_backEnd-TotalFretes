import amqp from 'amqplib';
import type { Channel, ChannelModel } from 'amqplib';
import { logger } from '../config/logging';
import {
  assertNotificationsTopology,
  buildNotificationsAmqpUri,
  notificationsAmqpConfig,
} from './notifications.amqp';

let connection: ChannelModel | null = null;
let channel: Channel | null = null;
let isClosing = false;

function attachEvents(target: ChannelModel | Channel, label: string): void {
  target.on('error', (err) => logger.error(`[rabbitmq] ${label} error`, { err }));
  target.on('close', () => {
    if (!isClosing) {
      logger.warn(`[rabbitmq] ${label} closed unexpectedly`);
    }
  });
}

async function connectWithRetry(maxAttempts = 30, delayMs = 2000): Promise<ChannelModel> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await amqp.connect(buildNotificationsAmqpUri(), {
        clientProperties: { connection_name: 'freight-service-notifications' },
      });
    } catch (err) {
      lastError = err;
      if (attempt === maxAttempts) break;
      logger.warn('[rabbitmq] unavailable, retrying', { attempt, maxAttempts, delayMs });
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

export async function startNotificationPublisher(): Promise<void> {
  connection = await connectWithRetry();
  attachEvents(connection, 'connection');

  const ch = await connection.createChannel();
  channel = ch;
  attachEvents(ch, 'channel');

  await assertNotificationsTopology(ch);
  logger.info('[notification publisher] ready');
}

export function getNotificationChannel(): Channel | null {
  return channel;
}

export async function stopNotificationPublisher(): Promise<void> {
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

export function getNotificationsQueueName(): string {
  return notificationsAmqpConfig().queue;
}
