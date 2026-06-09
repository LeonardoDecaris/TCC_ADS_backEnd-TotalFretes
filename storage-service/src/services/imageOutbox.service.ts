import crypto from 'crypto';
import { Op } from 'sequelize';
import ImageOutboxEvent from '../models/imageOutboxEvent.model';

export type ImageDomainEventType =
  | 'ImageCreated'
  | 'ImageUpdated'
  | 'ImageDeleted'
  | 'ImageReconciliationIssue';

export async function enqueueImageEvent(params: {
  eventType: ImageDomainEventType;
  imageKind: string;
  imageId?: number | null;
  payload: Record<string, unknown>;
}): Promise<void> {
  await ImageOutboxEvent.create({
    eventId: crypto.randomUUID(),
    eventType: params.eventType,
    imageKind: params.imageKind,
    imageId: params.imageId ?? null,
    payload: params.payload,
    status: 'PENDING',
    attempts: 0,
    lastError: null,
  });
}

export async function getPendingOutboxEvents(limit: number): Promise<ImageOutboxEvent[]> {
  return ImageOutboxEvent.findAll({
    where: {
      [Op.or]: [{ status: 'PENDING' }, { status: 'FAILED' }],
    },
    order: [['createdAt', 'ASC']],
    limit,
  });
}

export async function markOutboxEventPublished(id: number): Promise<void> {
  await ImageOutboxEvent.update(
    {
      status: 'PUBLISHED',
      publishedAt: new Date(),
      lastError: null,
    },
    {
      where: { id },
    },
  );
}

export async function markOutboxEventFailed(id: number, error: unknown): Promise<void> {
  await ImageOutboxEvent.increment(
    { attempts: 1 },
    { where: { id } },
  );
  await ImageOutboxEvent.update(
    {
      status: 'FAILED',
      lastError: error instanceof Error ? error.message.slice(0, 500) : String(error).slice(0, 500),
    },
    {
      where: { id },
    },
  );
}
