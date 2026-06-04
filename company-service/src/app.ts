import cors from 'cors';
import express from 'express';

import { apiDocs } from './api-docs';
import companyRoutes from './routes/company.routes';
import addressRoutes from './routes/address.routes';
import { requestLoggerMiddleware } from './middlewares/requestLogger';
import { ErrorHandlerMiddleware } from './middlewares/errors';

const app = express();
app.use(cors());
app.use(express.json());
app.use(requestLoggerMiddleware);

app.get('/', (_req, res) => {
  res.send('Company Service is running');
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', PID: process.pid });
});

app.get('/api-docs', (_req, res) => res.json(apiDocs));

app.use('/company', companyRoutes);
app.use('/address', addressRoutes);

app.use(ErrorHandlerMiddleware);

export default app;
