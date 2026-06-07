import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import type { IncomingMessage } from 'http';
import app from './app';
import {
  addFreightWatcher,
  removeFreightWatcher,
  removeSocketFromAllFreights,
} from './clients/freightWatchers';
import { logger } from './config/logger';
import { assertCanViewTrail, fetchFreightById } from './services/freightClient';
import { AuthPayload, verifyToken } from './utils/jwt';

type WsClientMeta = {
  userId: number;
  role: string;
  token: string;
  watchedFreights: Set<number>;
};

const clientMeta = new WeakMap<WebSocket, WsClientMeta>();

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

    let decoded: AuthPayload;

    try {
      decoded = verifyToken(token);
      if (!decoded.id || !decoded.role) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }
    } catch {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws: WebSocket) => {
      handleConnection(ws, {
        userId: Number(decoded.id),
        role: decoded.role!,
        token,
      });
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

function handleConnection(
  ws: WebSocket,
  auth: { userId: number; role: string; token: string },
): void {
  const meta: WsClientMeta = {
    userId: auth.userId,
    role: auth.role,
    token: auth.token,
    watchedFreights: new Set(),
  };
  clientMeta.set(ws, meta);

  logger.info('[telemetry-ws] client connected', { userId: auth.userId, role: auth.role });

  ws.on('message', (raw: WebSocket.RawData) => {
    void handleMessage(ws, raw);
  });

  ws.on('close', () => {
    const m = clientMeta.get(ws);
    if (m) {
      for (const freightId of m.watchedFreights) {
        removeFreightWatcher(freightId, ws);
      }
    }
    removeSocketFromAllFreights(ws);
    clientMeta.delete(ws);
    logger.info('[telemetry-ws] client disconnected', { userId: auth.userId });
  });

  ws.on('error', (err: Error) => {
    removeSocketFromAllFreights(ws);
    clientMeta.delete(ws);
    logger.error('[telemetry-ws] socket error', { userId: auth.userId, err });
  });
}

async function handleMessage(ws: WebSocket, raw: WebSocket.RawData): Promise<void> {
  const meta = clientMeta.get(ws);
  if (!meta) return;

  let payload: unknown;
  try {
    payload = JSON.parse(String(raw));
  } catch {
    return;
  }

  if (!payload || typeof payload !== 'object') return;

  const action = (payload as { action?: string }).action;
  const freightIdRaw = (payload as { freightId?: unknown }).freightId;
  const freightId = Number(freightIdRaw);

  if (!action || !Number.isFinite(freightId) || freightId <= 0) return;

  if (action === 'WATCH_FREIGHT') {
    try {
      const freight = await fetchFreightById(freightId, `Bearer ${meta.token}`);
      if (!freight) {
        ws.send(JSON.stringify({ event: 'ERROR', data: { message: 'Frete não encontrado' } }));
        return;
      }
      assertCanViewTrail(freight, { id: meta.userId, role: meta.role });
      addFreightWatcher(freightId, ws);
      meta.watchedFreights.add(freightId);
      ws.send(JSON.stringify({ event: 'WATCH_ACK', data: { freightId } }));
    } catch {
      ws.send(JSON.stringify({ event: 'ERROR', data: { message: 'Sem permissão para assistir este frete' } }));
    }
    return;
  }

  if (action === 'UNWATCH_FREIGHT') {
    removeFreightWatcher(freightId, ws);
    meta.watchedFreights.delete(freightId);
    ws.send(JSON.stringify({ event: 'UNWATCH_ACK', data: { freightId } }));
  }
}
