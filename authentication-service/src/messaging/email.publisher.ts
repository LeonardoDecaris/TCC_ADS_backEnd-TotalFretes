import amqp from 'amqplib';
import type { ChannelModel, ConfirmChannel, Options } from 'amqplib';
import { assertEmailTopology, buildEmailAmqpUri, emailAmqpConfig } from './email.amqp';
import {
  EMAIL_EVENT_PASSWORD_RESET,
  type PasswordResetEmailMessage,
} from '@total-fretes/rpc-contracts';
import { logger } from '../config/logging';
import { logError } from '@total-fretes/logging';

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

let connection: ChannelModel | null  = null;
let channel: ConfirmChannel | null   = null;
let isClosing = false;

function attachEvents(target: ChannelModel | ConfirmChannel, label: string): void {
  target.on('error', (err) => logError(logger, `[email publisher] ${label} error`, err));
  target.on('close', () => {
    if (!isClosing) logger.warn(`[email publisher] ${label} closed unexpectedly`);
  });
}

export async function startEmailPublisher(): Promise<void> {
  connection = await amqp.connect(buildEmailAmqpUri(), {
    clientProperties: { connection_name: 'authentication-service-email-publisher' },
  });
  attachEvents(connection, 'connection');

  channel = await connection.createConfirmChannel();
  attachEvents(channel, 'channel');

  await assertEmailTopology(channel);

  logger.info('[email publisher] ready');
}

export async function publishPasswordResetEmail(payload: {
  email: string;
  codigo: string;
}): Promise<void> {
  if (!channel) throw new Error('Email publisher is not initialized.');

  const { exchange, routingKey } = emailAmqpConfig();
  const message: PasswordResetEmailMessage = {
    type: EMAIL_EVENT_PASSWORD_RESET,
    email: payload.email,
    codigo: payload.codigo,
  };
  const body = Buffer.from(JSON.stringify(message));

  await publishConfirmed(channel, exchange, routingKey, body, {
    persistent:  true,
    contentType: 'application/json',
  });
}

export async function stopEmailPublisher(): Promise<void> {
  isClosing = true;
  try { await channel?.close();    } catch { /* ignore */ }
  try { await connection?.close(); } catch { /* ignore */ }
  channel    = null;
  connection = null;
  isClosing  = false;
}
