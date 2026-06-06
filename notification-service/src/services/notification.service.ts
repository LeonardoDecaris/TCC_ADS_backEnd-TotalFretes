import Notification, { NotificationCreationAttributes } from '../models/notification.model';

export type SaveNotificationInput = Omit<NotificationCreationAttributes, 'read_at'> & {
  metadata?: Record<string, unknown> | null;
};

export async function saveNotification(data: SaveNotificationInput): Promise<Notification> {
  return Notification.create({
    user_id: data.user_id,
    type: data.type,
    title: data.title,
    body: data.body,
    metadata: data.metadata ?? null,
    read_at: null,
  });
}

export async function getUnreadByUser(userId: number): Promise<Notification[]> {
  return Notification.findAll({
    where: { user_id: userId, read_at: null },
    order: [['created_at', 'DESC']],
  });
}

export async function markAsRead(id: number, userId: number): Promise<Notification | null> {
  const notification = await Notification.findOne({
    where: { id, user_id: userId },
  });

  if (!notification) {
    return null;
  }

  if (notification.read_at == null) {
    notification.read_at = new Date();
    await notification.save();
  }

  return notification;
}

export function toNotificationPayload(notification: Notification) {
  return {
    id: Number(notification.id),
    user_id: notification.user_id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    metadata: notification.metadata,
    read_at: notification.read_at,
    created_at: notification.created_at,
  };
}
