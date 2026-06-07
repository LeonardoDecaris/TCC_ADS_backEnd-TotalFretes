import { logger } from '../config/logger';
import { getNotificationChannel, getNotificationsQueueName } from './rabbitmq';

export type NotificationPublishInput = {
  userId: number;
  type: string;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
};

export function publishNotification(input: NotificationPublishInput): void {
  try {
    const ch = getNotificationChannel();
    if (!ch) {
      logger.warn('[notification publisher] channel not ready, skipping publish', {
        type: input.type,
        userId: input.userId,
      });
      return;
    }

    const queue = getNotificationsQueueName();
    const body = Buffer.from(
      JSON.stringify({
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        metadata: input.metadata ?? {},
      }),
    );

    const sent = ch.sendToQueue(queue, body, {
      persistent: true,
      contentType: 'application/json',
    });

    if (!sent) {
      logger.warn('[notification publisher] channel buffer full', {
        type: input.type,
        userId: input.userId,
      });
    }
  } catch (err) {
    logger.error('[notification publisher] failed to publish', {
      type: input.type,
      userId: input.userId,
      err,
    });
  }
}
