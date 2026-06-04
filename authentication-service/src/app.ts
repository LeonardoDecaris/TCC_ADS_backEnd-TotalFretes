import cors from 'cors';
import express from 'express';

import { apiDocs } from './api-docs';
import authRoutes from './routes/auth.routes';
import accountRoutes from './routes/account.routes';
import { requestLoggerMiddleware } from './middlewares/requestLogger';
import { ErrorHandlerMiddleware } from './middlewares/errors';

const app = express();
app.use(cors());
app.use(express.json());
app.use(requestLoggerMiddleware);

app.get('/', (_req, res) => {
  res.send('Authentication Service is running');
});

app.get('/api-docs', (_req, res) => res.json(apiDocs));
app.use('/auth', authRoutes);
app.use('/account', accountRoutes);

app.use(ErrorHandlerMiddleware);

export default app;
