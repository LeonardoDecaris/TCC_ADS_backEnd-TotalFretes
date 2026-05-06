import type { Channel } from 'amqplib';

const HEARTBEAT_SEC = 60;

export function emailAmqpConfig(): {
  exchange: string;
  routingKey: string;
  queue: string;
  dlx: string;
  failedQueue: string;
} {
  return {
    exchange: process.env.EMAIL_EVENTS_EXCHANGE ?? 'email.events',
    queue: process.env.EMAIL_SEND_QUEUE ?? 'email.send',
    routingKey:
      process.env.EMAIL_ROUTING_KEY_PASSWORD_RESET ?? 'email.send.password_reset',
    dlx: process.env.EMAIL_DLX_EXCHANGE ?? 'email.dlx',
    failedQueue: process.env.EMAIL_SEND_FAILED_QUEUE ?? 'email.send.failed',
  };
}

export function buildEmailAmqpUri(): string {
  const raw = process.env.RABBITMQ_URL;
  if (!raw) throw new Error('RABBITMQ_URL is not defined.');
  try {
    const u = new URL(raw);
    if (!u.searchParams.has('heartbeat')) u.searchParams.set('heartbeat', String(HEARTBEAT_SEC));
    return u.toString();
  } catch {
    return raw;
  }
}

export async function assertEmailTopology(ch: Channel): Promise<void> {
  const { exchange, queue, routingKey, dlx, failedQueue } = emailAmqpConfig();

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
