/**
 * user-service/src/messaging/rpc.client.ts
 *
 * Generic RabbitMQ RPC client.
 * Use rpcCall() to communicate with any service queue — no axios between services.
 */

import crypto from 'crypto';
import amqp from 'amqplib';
import type { Channel, ChannelModel } from 'amqplib';
import { type RpcEnvelope, rpcError } from '../shared/rpc.types';

const HEARTBEAT_SEC   = 60;
const RPC_TIMEOUT_MS  = 15_000;
const RECONNECT_DELAY = 3_000;

// ── config ────────────────────────────────────────────────────────────────────

function buildAmqpUri(): string {
  const raw = process.env.RABBITMQ_URL ?? '';
  try {
    const u = new URL(raw);
    if (!u.searchParams.has('heartbeat')) u.searchParams.set('heartbeat', String(HEARTBEAT_SEC));
    return u.toString();
  } catch {
    return raw;
  }
}

// ── state ─────────────────────────────────────────────────────────────────────

type PendingCall = {
  resolve: (value: RpcEnvelope) => void;
  timer:   ReturnType<typeof setTimeout>;
};

let connection:  ChannelModel | null = null;
let channel:     Channel | null      = null;
let replyQueue:  string | null       = null;
let isClosing    = false;
let isConnecting = false;

const pending = new Map<string, PendingCall>();

// ── helpers ───────────────────────────────────────────────────────────────────

function normalizeCid(value: unknown): string | null {
  if (value == null)          return null;
  if (Buffer.isBuffer(value)) return value.toString('utf8');
  return String(value);
}

function rejectAll(reason: string): void {
  for (const [cid, entry] of pending) {
    clearTimeout(entry.timer);
    entry.resolve(rpcError(`rpc-client: ${reason}`));
    pending.delete(cid);
    console.warn(`[rpc-client] cancelled [${cid}] — ${reason}`);
  }
}

function scheduleReconnect(): void {
  if (!isClosing) setTimeout(() => void connect(), RECONNECT_DELAY);
}

function attachEvents(
  target:  ChannelModel | Channel,
  label:   string,
  onClose: () => void,
): void {
  target.on('error', (err) => console.error(`[rpc-client] ${label} error:`, err));
  target.on('close', () => {
    if (!isClosing) {
      console.warn(`[rpc-client] ${label} closed — reconnecting…`);
      onClose();
    }
  });
}

// ── connection lifecycle ──────────────────────────────────────────────────────

async function connect(): Promise<void> {
  if (isConnecting || isClosing) return;
  isConnecting = true;

  try {
    const uri = buildAmqpUri();
    if (!uri) throw new Error('RABBITMQ_URL is not defined.');

    connection = await amqp.connect(uri, {
      clientProperties: { connection_name: 'user-service-rpc-client' },
    });

    attachEvents(connection, 'connection', () => {
      connection = null;
      channel    = null;
      replyQueue = null;
      rejectAll('connection closed');
      scheduleReconnect();
    });

    channel = await connection.createChannel();

    attachEvents(channel, 'channel', () => {
      channel    = null;
      replyQueue = null;
      rejectAll('channel closed');
      scheduleReconnect();
    });

    const { queue } = await channel.assertQueue('', {
      exclusive:  true,
      autoDelete: true,
      durable:    false,
    });
    replyQueue = queue;

    await channel.consume(
      replyQueue,
      (msg) => {
        if (!msg) return;

        const cid   = normalizeCid(msg.properties.correlationId);
        const entry = cid ? pending.get(cid) : undefined;
        if (!cid || !entry) return;

        pending.delete(cid);
        clearTimeout(entry.timer);

        try {
          const envelope = JSON.parse(msg.content.toString()) as RpcEnvelope;
          entry.resolve(envelope);
        } catch {
          entry.resolve(rpcError('rpc-client: malformed response'));
        }
      },
      { noAck: true },
    );

    console.info('[rpc-client] connected and ready.');
  } catch (err) {
    console.error('[rpc-client] connect error:', err);
    scheduleReconnect();
  } finally {
    isConnecting = false;
  }
}

// ── public API ────────────────────────────────────────────────────────────────

export async function startRpcClient(): Promise<void> {
  await connect();
}

/**
 * Send an RPC call to `queue` with `payload`.
 * Always returns an RpcEnvelope — never throws.
 */
export async function rpcCall<TPayload, TData = undefined>(
  queue:   string,
  payload: TPayload,
): Promise<RpcEnvelope<TData>> {
  const ch = channel;
  const rq = replyQueue;

  if (!ch || !rq) {
    console.error('[rpc-client] channel not ready');
    return rpcError('rpc-client: not connected');
  }

  const correlationId = crypto.randomUUID();

  return new Promise<RpcEnvelope<TData>>((resolve) => {
    const timer = setTimeout(() => {
      pending.delete(correlationId);
      console.error(`[rpc-client] timeout [${correlationId}] on queue "${queue}"`);
      resolve(rpcError('rpc-client: timeout'));
    }, RPC_TIMEOUT_MS);

    pending.set(correlationId, {
      resolve: resolve as (v: RpcEnvelope) => void,
      timer,
    });

    const body = Buffer.from(JSON.stringify(payload));

    const send = (): void => {
      const drained = ch.sendToQueue(queue, body, {
        persistent:  true,
        replyTo:     rq,
        correlationId,
        contentType: 'application/json',
      });
      if (!drained) ch.once('drain', send);
    };

    send();
  });
}

export async function stopRpcClient(): Promise<void> {
  isClosing = true;
  rejectAll('client shutting down');
  try { await channel?.close();    } catch { /* ignore */ }
  try { await connection?.close(); } catch { /* ignore */ }
  channel    = null;
  connection = null;
  replyQueue = null;
  isClosing  = false;
}