import cors from 'cors';
import express from 'express';
import notificationsRoutes from './routes/notifications.routes';
import { getOnlineCount } from './clients';

const app = express();

app.use(cors());
app.use(express.json());

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

app.use('/notifications', notificationsRoutes);

export default app;
