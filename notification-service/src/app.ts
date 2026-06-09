import cors from 'cors';
import express from 'express';
import { apiDocs } from './api-docs';
import notificationsRoutes from './routes/notifications.routes';
import { getOnlineCount } from './clients';
import { requestIdMiddleware, requestLoggerMiddleware } from './config/logging';
import { ErrorHandlerMiddleware } from './middlewares/errors';

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);

app.get('/', (_req, res) => {
  res.send('Notification Service is running');
});

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    PID: process.pid,
    onlineUsers: getOnlineCount(),
  });
});

app.get('/api-docs', (_req, res) => {
  res.json(apiDocs);
});

app.use('/notifications', notificationsRoutes);

app.use(ErrorHandlerMiddleware);

export default app;
