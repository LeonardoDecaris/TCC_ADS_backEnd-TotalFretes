import amqp from 'amqplib';
import type { Channel, ChannelModel, ConfirmChannel, Options } from 'amqplib';

// ─── config ───────────────────────────────────────────────────────────────────

const HEARTBEAT_SEC = 60;

function config() {
  return {
    exchange:    process.env.EMAIL_EVENTS_EXCHANGE                  ?? 'email.events',
    queue:       process.env.EMAIL_SEND_QUEUE                       ?? 'email.send',
    routingKey:  process.env.EMAIL_ROUTING_KEY_PASSWORD_RESET       ?? 'email.send.password_reset',
    dlx:         process.env.EMAIL_DLX_EXCHANGE                     ?? 'email.dlx',
    failedQueue: process.env.EMAIL_SEND_FAILED_QUEUE                ?? 'email.send.failed',
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

// ─── topology ─────────────────────────────────────────────────────────────────

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

// ─── publish helper ───────────────────────────────────────────────────────────

function publishConfirmed(
  ch: ConfirmChannel,
  exchange: string,
  routingKey: string,
  body: Buffer,
  options: Options.Publish,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const send = (): void => {
      const written = ch.publish(exchange, routingKey, body, options, (err) => {
        if (err) reject(err);
        else resolve();
      });
      if (!written) ch.once('drain', send);
    };
    send();
  });
}

// ─── state ────────────────────────────────────────────────────────────────────

let connection: ChannelModel | null = null;
let channel: ConfirmChannel | null  = null;
let isClosing = false;

// ─── helpers ──────────────────────────────────────────────────────────────────

function attachEvents(target: ChannelModel | Channel, label: string): void {
  target.on('error', (err) => console.error(`[email publisher] ${label} error:`, err));
  target.on('close', () => {
    if (!isClosing) console.warn(`[email publisher] ${label} closed unexpectedly`);
  });
}

// ─── public API ───────────────────────────────────────────────────────────────

export async function initEmailPublisher(): Promise<void> {
  connection = await amqp.connect(amqpUri(), {
    clientProperties: { connection_name: 'authentication-service-email-publisher' },
  });
  attachEvents(connection, 'connection');

  channel = await connection.createConfirmChannel();
  attachEvents(channel, 'channel');

  await assertTopology(channel);

  console.info('[email publisher] ready');
}

export async function publishPasswordResetEmail(payload: {
  email: string;
  codigo: string;
}): Promise<void> {
  if (!channel) throw new Error('Email publisher is not initialized.');

  const { exchange, routingKey } = config();
  const body = Buffer.from(
    JSON.stringify({ type: 'password_reset', email: payload.email, codigo: payload.codigo }),
  );

  await publishConfirmed(channel, exchange, routingKey, body, {
    persistent:  true,
    contentType: 'application/json',
  });
}

export async function closeEmailPublisher(): Promise<void> {
  isClosing = true;
  try { await channel?.close();    } catch { /* ignore */ }
  try { await connection?.close(); } catch { /* ignore */ }
  channel    = null;
  connection = null;
  isClosing  = false;
}