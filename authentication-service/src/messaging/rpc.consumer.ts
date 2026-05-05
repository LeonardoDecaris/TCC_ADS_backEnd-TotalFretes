import amqp from 'amqplib';
import type { Channel, ChannelModel, ConsumeMessage } from 'amqplib';
import { type RpcEnvelope, rpcError } from '../shared/rpc.types';

const HEARTBEAT_SEC = 60;
const PREFETCH = 1;


function buildAmqpUri(): string {
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

export type RpcHandler<TPayload = unknown, TData = undefined> = (
  payload: TPayload,
) => Promise<RpcEnvelope<TData>>;

type Registration = {
  queue: string;
  handler: RpcHandler<unknown, unknown>;
};

let connection: ChannelModel | null = null;
let channel: Channel | null = null;
let isClosing = false;

const registrations: Registration[] = [];

function normalizeCid(value: unknown): string | null {
  if (value == null) return null;
  if (Buffer.isBuffer(value)) return value.toString('utf8');
  return String(value);
}

function sendReply(
  ch: Channel,
  replyTo: string,
  correlationId: string,
  envelope: RpcEnvelope,
): void {
  const body = Buffer.from(JSON.stringify(envelope));
  const send = (): void => {
    const drained = ch.sendToQueue(replyTo, body, { correlationId });
    if (!drained) ch.once('drain', send);
  };
  send();
}

function attachEvents(target: ChannelModel | Channel, label: string): void {
  target.on('error', (err) => console.error(`[rpc-consumer] ${label} error:`, err));
  target.on('close', () => {
    if (!isClosing) console.warn(`[rpc-consumer] ${label} closed unexpectedly`);
  });
}

async function handleMessage(
  msg: ConsumeMessage,
  ch: Channel,
  handler: RpcHandler<unknown, unknown>,
): Promise<void> {
  const replyTo = msg.properties.replyTo as string | undefined;
  const correlationId = normalizeCid(msg.properties.correlationId);

  if (!replyTo || !correlationId) {
    ch.ack(msg);
    return;
  }

  const reply = (envelope: RpcEnvelope): void => {
    sendReply(ch, replyTo, correlationId, envelope);
    ch.ack(msg);
  };

  try {
    const raw = JSON.parse(msg.content.toString()) as unknown;
    const envelope = await handler(raw);
    reply(envelope as RpcEnvelope);
  } catch (err) {
    console.error('[rpc-consumer] unhandled handler error:', err);
    reply(rpcError('rpc-consumer: internal error'));
  }
}


export function registerHandler<TPayload, TData = undefined>(
  queue: string,
  handler: RpcHandler<TPayload, TData>,
): void {
  registrations.push({ queue, handler: handler as RpcHandler<unknown, unknown> });
}

export async function startRpcConsumer(): Promise<void> {
  if (registrations.length === 0) {
    console.warn('[rpc-consumer] no handlers registered — nothing to consume.');
    return;
  }

  connection = await amqp.connect(buildAmqpUri(), {
    clientProperties: { connection_name: 'authentication-service-rpc-consumer' },
  });
  attachEvents(connection, 'connection');

  channel = await connection.createChannel();
  attachEvents(channel, 'channel');
  await channel.prefetch(PREFETCH);

  for (const { queue, handler } of registrations) {
    await channel.assertQueue(queue, { durable: true });
    await channel.consume(
      queue,
      (msg) => {
        if (!msg || !channel) return;
        void handleMessage(msg, channel, handler);
      },
      { noAck: false },
    );
    console.info(`[rpc-consumer] listening on queue "${queue}"`);
  }
}

export async function stopRpcConsumer(): Promise<void> {
  isClosing = true;
  try { await channel?.close(); } catch { /* ignore */ }
  try { await connection?.close(); } catch { /* ignore */ }
  channel = null;
  connection = null;
  isClosing = false;
}