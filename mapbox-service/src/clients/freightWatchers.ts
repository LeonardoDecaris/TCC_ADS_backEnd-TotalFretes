import { WebSocket } from 'ws';

const watchersByFreight = new Map<number, Set<WebSocket>>();

export function addFreightWatcher(freightId: number, ws: WebSocket): void {
  const set = watchersByFreight.get(freightId) ?? new Set<WebSocket>();
  set.add(ws);
  watchersByFreight.set(freightId, set);
}

export function removeFreightWatcher(freightId: number, ws: WebSocket): void {
  const set = watchersByFreight.get(freightId);
  if (!set) return;
  set.delete(ws);
  if (set.size === 0) {
    watchersByFreight.delete(freightId);
  }
}

export function removeSocketFromAllFreights(ws: WebSocket): void {
  for (const [freightId, set] of watchersByFreight.entries()) {
    set.delete(ws);
    if (set.size === 0) {
      watchersByFreight.delete(freightId);
    }
  }
}

export type DriverLocationPayload = {
  freightId: number;
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  recordedAt: string;
};

export function broadcastDriverLocation(payload: DriverLocationPayload): void {
  const set = watchersByFreight.get(payload.freightId);
  if (!set || set.size === 0) return;

  const message = JSON.stringify({
    event: 'DRIVER_LOCATION',
    data: payload,
  });

  for (const ws of set) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  }
}
