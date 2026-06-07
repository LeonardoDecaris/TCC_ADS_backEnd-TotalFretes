import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import type { IncomingMessage } from 'http';
import app from './app';
import { addClient, removeClient } from './clients';
import { logger } from './config/logger';
import { getUnreadByUser, toNotificationPayload } from './services/notification.service';
import { verifyToken } from './utils/jwt';

export function createServer() {
  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (req, socket, head) => {
    const pathname = req.url?.split('?')[0];

    if (pathname !== '/ws') {
      socket.destroy();
      return;
    }

    const token = extractToken(req);
    if (!token) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    let userId: number;

    try {
      const decoded = verifyToken(token);
      if (!decoded.id) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }
      userId = Number(decoded.id);
    } catch {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      handleConnection(ws, userId);
    });
  });

  return server;
}

function extractToken(req: IncomingMessage): string | null {
  try {
    const host = req.headers.host ?? 'localhost';
    const url = new URL(req.url ?? '/', `http://${host}`);
    return url.searchParams.get('token');
  } catch {
    return null;
  }
}

function handleConnection(ws: WebSocket, userId: number): void {
  addClient(userId, ws);
  logger.info('[websocket] client connected', { userId });

  void (async () => {
    try {
      const unread = await getUnreadByUser(userId);
      if (unread.length === 0) return;

      ws.send(
        JSON.stringify({
          event: 'UNREAD_NOTIFICATIONS',
          data: unread.map(toNotificationPayload),
        }),
      );
    } catch (err) {
      logger.error('[websocket] failed to send unread buffer', { userId, err });
    }
  })();

  ws.on('close', () => {
    removeClient(userId, ws);
    logger.info('[websocket] client disconnected', { userId });
  });

  ws.on('error', (err) => {
    removeClient(userId, ws);
    logger.error('[websocket] socket error', { userId, err });
  });
}
