import { Request, Response, Router } from 'express';
import { authMiddleware, allowOwnerOrAdmin } from '../middleware/authMiddleware';
import {
  getUnreadByUser,
  markAsRead,
  toNotificationPayload,
} from '../services/notification.service';

const router = Router();

router.get('/:userId', authMiddleware, allowOwnerOrAdmin, async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid userId' });
    }

    const notifications = await getUnreadByUser(userId);
    return res.status(200).json(notifications.map(toNotificationPayload));
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch notifications',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.patch('/:id/read', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || !req.user) {
      return res.status(400).json({ message: 'Invalid notification id' });
    }

    const notification = await markAsRead(id, req.user.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    return res.status(200).json(toNotificationPayload(notification));
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to mark notification as read',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
