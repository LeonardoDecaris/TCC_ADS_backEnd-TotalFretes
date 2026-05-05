import crypto from 'crypto';
import amqp from 'amqplib';
import type { Channel, ChannelModel } from 'amqplib';

const HEARTBEAT_SEC   = 60;
const RPC_TIMEOUT_MS  = 15_000
const RECONNECT_DELAY = 3_000

function amqpUri(): string {
  const url = process.env.RABBITMQ_URL ?? '';
  try {
    const u = new URL(url);
    if (!u.searchParams.has('heartbeat')) u.searchParams.set('heartbeat', String(HEARTBEAT_SEC));
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * @description Get the name of the RPC queue.
 * @returns The name of the RPC queue.
 */
function rpcQueueName(): string {
  return process.env.ACCOUNT_CREATE_RPC_QUEUE ?? 'account.create.rpc';
}

export type AccountRpcPayload = {
  email: string;
  password: string;
  subject_id: number;
  account_type_id: number;
};

type PendingRpc = {
  resolve: (value: { ok: boolean }) => void;
  timer: ReturnType<typeof setTimeout>;
};

let connection:  ChannelModel | null = null;
let channel:     Channel | null      = null;
let replyQueue:  string | null       = null;
let isClosing    = false;
let isConnecting = false;

const pending = new Map<string, PendingRpc>();

/**
 * @description Normalize the correlation ID.
 * @param value - The value to normalize.
 * @returns The normalized correlation ID.
 */
function normalizeCid(value: unknown): string | null {
  if (value == null) return null;
  if (Buffer.isBuffer(value)) return value.toString('utf8');
  return String(value);
}

/**
 * @description Reject all pending RPCs.
 * @param reason - The reason for the rejection.
 * @returns void
 */
function rejectAll(reason: string): void {
  for (const [cid, entry] of pending) {
    clearTimeout(entry.timer);
    entry.resolve({ ok: false });
    pending.delete(cid);
    console.warn(`[account-rpc client] cancelled pending RPC [${cid}] — ${reason}`);
  }
}

/**
 * @description Schedule a reconnect.
 * @returns void
 */
function scheduleReconnect(): void {
  if (!isClosing) setTimeout(() => void connect(), RECONNECT_DELAY);
}

/**
 * @description Attach events to the channel.
 * @param target - The target to attach the events to.
 * @param label - The label of the target.
 * @param onClose - The function to call when the channel is closed.
 * @returns void
 */
function attachEvents(target: ChannelModel | Channel, label: string, onClose: () => void): void {
  target.on('error', (err) => console.error(`[account-rpc client] ${label} error:`, err));
  target.on('close', () => {
    if (!isClosing) {
      console.warn(`[account-rpc client] ${label} closed — reconnecting...`);
      onClose();
    }
  });
}

/**
 * @description Connect to the RabbitMQ server.
 * @returns void
 */
async function connect(): Promise<void> {
  if (isConnecting || isClosing) return;
  isConnecting = true;

  try {
    const url = process.env.RABBITMQ_URL;
    if (!url) throw new Error('Environment variable RABBITMQ_URL is not defined.');

    connection = await amqp.connect(amqpUri(), {
      clientProperties: { connection_name: 'user-service-account-rpc' },
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

    await channel.assertQueue(rpcQueueName(), { durable: true });

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
          const data = JSON.parse(msg.content.toString()) as { ok?: boolean };
          entry.resolve({ ok: !!data.ok });
        } catch {
          entry.resolve({ ok: false });
        }
      },
      { noAck: true },
    );

    console.info('[account-rpc client] connected and ready.');
  } catch (err) {
    console.error('[account-rpc client] connect error:', err);
    scheduleReconnect();
  } finally {
    isConnecting = false;
  }
}

/**
 * @description Connect to the account RPC server.
 * @returns void
 */
export async function startAccountRpcClient(): Promise<void> {
  await connect();
}

export async function createAccountRpc(
  payload: AccountRpcPayload,
): Promise<{ ok: boolean }> {
  const ch = channel;
  const rq = replyQueue;

  if (!ch || !rq) {
    console.error('[account-rpc client] channel not ready');
    return { ok: false };
  }

  const correlationId = crypto.randomUUID();

  return new Promise<{ ok: boolean }>((resolve) => {
    const timer = setTimeout(() => {
      pending.delete(correlationId);
      console.error(`[account-rpc client] timeout [${correlationId}]`);
      resolve({ ok: false });
    }, RPC_TIMEOUT_MS);

    pending.set(correlationId, { resolve, timer });

    const body = Buffer.from(JSON.stringify(payload));

    const send = (): void => {
      const written = ch.sendToQueue(rpcQueueName(), body, {
        persistent:  true,
        replyTo:     rq,
        correlationId,
        contentType: 'application/json',
      });
      if (!written) ch.once('drain', send);
    };

    send();
  });
}

/**
 * @description Stop the account RPC client.
 * @returns void
 */
export async function stopAccountRpcClient(): Promise<void> {
  isClosing = true;
  rejectAll('client shutting down');
  try { await channel?.close();    } catch { /* ignore */ }
  try { await connection?.close(); } catch { /* ignore */ }
  channel    = null;
  connection = null;
  replyQueue = null;
  isClosing  = false;
}