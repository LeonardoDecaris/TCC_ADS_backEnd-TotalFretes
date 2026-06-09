import type { WebSocket } from 'ws';

const clients = new Map<number, Set<WebSocket>>();

export function addClient(userId: number, ws: WebSocket): void {
  const normalizedUserId = Number(userId);
  if (!clients.has(normalizedUserId)) {
    clients.set(normalizedUserId, new Set());
  }
  clients.get(normalizedUserId)!.add(ws);
}

export function removeClient(userId: number, ws: WebSocket): void {
  const normalizedUserId = Number(userId);
  const sockets = clients.get(normalizedUserId);
  if (!sockets) return;

  sockets.delete(ws);
  if (sockets.size === 0) {
    clients.delete(normalizedUserId);
  }
}

export function notifyUser(userId: number, payload: unknown): void {
  const sockets = clients.get(Number(userId));
  if (!sockets || sockets.size === 0) return;

  const message = JSON.stringify(payload);

  for (const ws of sockets) {
    if (ws.readyState === ws.OPEN) {
      try {
        ws.send(message);
      } catch {
        /* ignore send errors for dead sockets */
      }
    }
  }
}

export function getOnlineCount(): number {
  return clients.size;
}
