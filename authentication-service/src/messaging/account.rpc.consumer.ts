import amqp from 'amqplib';
import type { Channel, ChannelModel, ConsumeMessage } from 'amqplib';
import { createAccountRecord } from '../services/accountCreation.service';
import type { AccountCreationInput } from '../services/accountCreation.service';

const HEARTBEAT_SEC = 60;

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

function rpcQueueName(): string {
  return process.env.ACCOUNT_CREATE_RPC_QUEUE ?? 'account.create.rpc';
}


let connection: ChannelModel | null = null;
let channel: Channel | null = null;
let isClosing = false;

function normalizeCid(value: unknown): string | null {
  if (value == null) return null;
  if (Buffer.isBuffer(value)) return value.toString('utf8');
  return String(value);
}

function sendReply(ch: Channel, replyTo: string, correlationId: string, payload: { ok: boolean }): void {
  const body = Buffer.from(JSON.stringify(payload));
  const send = (): void => {
    const written = ch.sendToQueue(replyTo, body, { correlationId });
    if (!written) ch.once('drain', send);
  };
  send();
}

function attachEvents(target: ChannelModel | Channel, label: string): void {
  target.on('error', (err) => console.error(`[account-rpc consumer] ${label} error:`, err));
  target.on('close', () => {
    if (!isClosing) console.warn(`[account-rpc consumer] ${label} closed unexpectedly`);
  });
}

async function handleMessage(msg: ConsumeMessage, ch: Channel): Promise<void> {
  const replyTo       = msg.properties.replyTo as string | undefined;
  const correlationId = normalizeCid(msg.properties.correlationId);

  if (!replyTo || !correlationId) {
    ch.ack(msg);
    return;
  }

  const respond = (payload: { ok: boolean }): void => {
    sendReply(ch, replyTo, correlationId, payload);
    ch.ack(msg);
  };

  try {
    const raw = JSON.parse(msg.content.toString()) as unknown;

    if (typeof raw !== 'object' || raw === null) {
      respond({ ok: false });
      return;
    }

    const input = raw as Partial<AccountCreationInput>;
    const result = await createAccountRecord({
      email:           String(input.email ?? ''),
      password:        String(input.password ?? ''),
      subject_id:      Number(input.subject_id),
      account_type_id: Number(input.account_type_id),
    });

    respond({ ok: result.ok });
  } catch (err) {
    console.error('[account-rpc consumer] handler error:', err);
    respond({ ok: false });
  }
}

export async function startAccountRpcConsumer(): Promise<void> {
  connection = await amqp.connect(amqpUri(), {
    clientProperties: { connection_name: 'authentication-service-account-rpc' },
  });
  attachEvents(connection, 'connection');

  channel = await connection.createChannel();
  attachEvents(channel, 'channel');

  await channel.prefetch(1);

  const queue = rpcQueueName();
  await channel.assertQueue(queue, { durable: true });

  await channel.consume(
    queue,
    (msg) => {
      if (!msg || !channel) return;
      void handleMessage(msg, channel);
    },
    { noAck: false },
  );

  console.info(`[account-rpc consumer] listening on queue "${queue}"`);
}

export async function stopAccountRpcConsumer(): Promise<void> {
  isClosing = true;
  try { await channel?.close();    } catch { /* ignore */ }
  try { await connection?.close(); } catch { /* ignore */ }
  channel    = null;
  connection = null;
  isClosing  = false;
}