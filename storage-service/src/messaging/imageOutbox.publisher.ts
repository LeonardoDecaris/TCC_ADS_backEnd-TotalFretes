import amqp from 'amqplib';
import type { ChannelModel, ConfirmChannel } from 'amqplib';
import { logger } from '../config/logging';
import {
  getPendingOutboxEvents,
  markOutboxEventFailed,
  markOutboxEventPublished,
} from '../services/imageOutbox.service';
import { eventRoutingKey, imageEventsAmqpConfig } from './imageEvents.amqp';

let connection: ChannelModel | null = null;
let channel: ConfirmChannel | null = null;
let loopHandle: NodeJS.Timeout | null = null;
let isPublishing = false;
let isClosing = false;

async function connect(): Promise<void> {
  if (connection && channel) return;
  const cfg = imageEventsAmqpConfig();
  connection = await amqp.connect(cfg.uri, {
    clientProperties: { connection_name: 'storage-service-image-outbox-publisher' },
  });
  channel = await connection.createConfirmChannel();
  await channel.assertExchange(cfg.exchange, 'topic', { durable: true });
}

async function publishPendingBatch(): Promise<void> {
  if (isPublishing) return;
  if (!channel) return;
  isPublishing = true;

  try {
    const cfg = imageEventsAmqpConfig();
    const events = await getPendingOutboxEvents(50);
    for (const event of events) {
      if (!event.id || !event.eventId || !event.eventType) continue;
      try {
        const body = Buffer.from(
          JSON.stringify({
            eventId: event.eventId,
            eventType: event.eventType,
            imageKind: event.imageKind,
            imageId: event.imageId,
            payload: event.payload,
            occurredAt: event.createdAt ?? new Date(),
          }),
        );

        await new Promise<void>((resolve, reject) => {
          channel!.publish(
            cfg.exchange,
            eventRoutingKey(event.eventType!),
            body,
            {
              persistent: true,
              contentType: 'application/json',
              messageId: event.eventId!,
            },
            (err) => {
              if (err) reject(err);
              else resolve();
            },
          );
        });

        await markOutboxEventPublished(event.id);
      } catch (error) {
        logger.warn('failed to publish image outbox event', { eventId: event.eventId, error });
        await markOutboxEventFailed(event.id, error);
      }
    }
  } finally {
    isPublishing = false;
  }
}

export async function startImageOutboxPublisher(): Promise<void> {
  await connect();
  const intervalMs = Number(process.env.IMAGE_OUTBOX_PUBLISH_INTERVAL_MS ?? '3000');
  loopHandle = setInterval(() => {
    void publishPendingBatch();
  }, Number.isFinite(intervalMs) && intervalMs > 0 ? intervalMs : 3000);
}

export async function stopImageOutboxPublisher(): Promise<void> {
  isClosing = true;
  if (loopHandle) {
    clearInterval(loopHandle);
    loopHandle = null;
  }
  try {
    await channel?.close();
  } catch {
    // ignore close errors
  }
  try {
    await connection?.close();
  } catch {
    // ignore close errors
  }
  channel = null;
  connection = null;
  isClosing = false;
}
