import type { Channel, ConfirmChannel } from 'amqplib';

const HEARTBEAT_SEC = 60;

export function notificationsAmqpConfig(): {
  exchange: string;
  routingKey: string;
  queue: string;
  dlx: string;
  failedQueue: string;
} {
  return {
    exchange: process.env.NOTIFICATIONS_EXCHANGE ?? 'notifications.events',
    queue: process.env.NOTIFICATIONS_QUEUE ?? 'notifications.queue',
    routingKey: process.env.NOTIFICATIONS_ROUTING_KEY ?? 'notification.send',
    dlx: process.env.NOTIFICATIONS_DLX ?? 'notifications.dlx',
    failedQueue: process.env.NOTIFICATIONS_FAILED_QUEUE ?? 'notifications.failed',
  };
}

export function buildNotificationsAmqpUri(): string {
  const raw = process.env.RABBITMQ_URL;
  if (!raw) throw new Error('RABBITMQ_URL is not defined.');
  try {
    const u = new URL(raw);
    if (!u.searchParams.has('heartbeat')) {
      u.searchParams.set('heartbeat', String(HEARTBEAT_SEC));
    }
    return u.toString();
  } catch {
    return raw;
  }
}

export async function assertNotificationsTopology(ch: Channel | ConfirmChannel): Promise<void> {
  const { exchange, queue, routingKey, dlx, failedQueue } = notificationsAmqpConfig();

  await ch.assertExchange(dlx, 'direct', { durable: true });
  await ch.assertQueue(failedQueue, { durable: true });
  await ch.bindQueue(failedQueue, dlx, failedQueue);

  await ch.assertExchange(exchange, 'topic', { durable: true });
  await ch.assertQueue(queue, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': dlx,
      'x-dead-letter-routing-key': failedQueue,
    },
  });
  await ch.bindQueue(queue, exchange, routingKey);
}
