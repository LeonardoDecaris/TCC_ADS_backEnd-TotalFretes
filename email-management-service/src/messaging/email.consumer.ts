import amqp from 'amqplib';
import type { Channel, ChannelModel, ConsumeMessage } from 'amqplib';
import { sendPasswordResetEmail } from '../services/passwordResetMail';

const HEARTBEAT_SEC = 60;

function config() {
  return {
    exchange:    process.env.EMAIL_EVENTS_EXCHANGE            ?? 'email.events',
    queue:       process.env.EMAIL_SEND_QUEUE                 ?? 'email.send',
    routingKey:  process.env.EMAIL_ROUTING_KEY_PASSWORD_RESET ?? 'email.send.password_reset',
    dlx:         process.env.EMAIL_DLX_EXCHANGE               ?? 'email.dlx',
    failedQueue: process.env.EMAIL_SEND_FAILED_QUEUE          ?? 'email.send.failed',
  };
}

function amqpUri(): string {
  const url = process.env.RABBITMQ_URL;
  if (!url) throw new Error('Environment variable RABBITMQ_URL is not defined.');

  try {
    const u = new URL(url);
    if (!u.searchParams.has('heartbeat')) u.searchParams.set('heartbeat', String(HEARTBEAT_SEC));
    return u.toString();
  } catch {
    return url;
  }
}

async function assertTopology(ch: Channel): Promise<void> {
  const { dlx, failedQueue, exchange, queue, routingKey } = config();

  await ch.assertExchange(dlx, 'fanout', { durable: true });
  await ch.assertQueue(failedQueue, { durable: true });
  await ch.bindQueue(failedQueue, dlx, '');

  await ch.assertExchange(exchange, 'topic', { durable: true });
  await ch.assertQueue(queue, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange':    dlx,
      'x-dead-letter-routing-key': 'failed',
    },
  });
  await ch.bindQueue(queue, exchange, routingKey);
}

let connection: ChannelModel | null = null;
let isClosing = false;

function attachEvents(target: ChannelModel | Channel, label: string): void {
  target.on('error', (err) => console.error(`[email consumer] ${label} error:`, err));
  target.on('close', () => {
    if (!isClosing) console.warn(`[email consumer] ${label} closed unexpectedly`);
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

  if (
    typeof raw !== 'object' ||
    raw === null ||
    (raw as { type?: string }).type !== 'password_reset'
  ) {
    ch.ack(msg);
    return;
  }

  const { email, codigo } = raw as { email?: unknown; codigo?: unknown };

  if (typeof email !== 'string' || typeof codigo !== 'string' || !email || !codigo) {
    ch.ack(msg);
    return;
  }

  try {
    await sendPasswordResetEmail(email, codigo);
    ch.ack(msg);
  } catch (err) {
    console.error('[email consumer] failed to send email:', err);
    ch.nack(msg, false, false);
  }
}

export async function startEmailConsumer(): Promise<void> {
  connection = await amqp.connect(amqpUri(), {
    clientProperties: { connection_name: 'email-management-service-consumer' },
  });
  attachEvents(connection, 'connection');

  const ch = await connection.createChannel();
  attachEvents(ch, 'channel');

  await ch.prefetch(1);
  await assertTopology(ch);

  const { queue } = config();

  await ch.consume(
    queue,
    (msg) => {
      if (!msg) return;
      void handleMessage(msg, ch);
    },
    { noAck: false },
  );

  console.info(`[email consumer] listening on queue "${queue}"`);
}

export async function stopEmailConsumer(): Promise<void> {
  isClosing = true;
  try { await connection?.close(); } catch { /* ignore */ }
  connection = null;
  isClosing  = false;
}