import cors from 'cors';
import express from 'express';

import { apiDocs } from './api-docs';
import cargoTypeRoutes from './routes/cargoTypes.routes';
import freightRoutes from './routes/freight.routes';
import freightStatusTypeRoutes from './routes/freightStatusTypes.routes';
import proposalRoutes from './routes/proposals.routes';
import proposalStatusTypeRoutes from './routes/proposalsStatusTypes.routes';
import { requestLoggerMiddleware } from './middlewares/requestLogger';
import { ErrorHandlerMiddleware } from './middlewares/errors';

const app = express();
app.use(cors());
app.use(express.json());
app.use(requestLoggerMiddleware);

app.get('/', (_req, res) => {
  res.send('Freight Service is running');
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', PID: process.pid });
});

app.get('/api-docs', (_req, res) => res.json(apiDocs));

app.use('/cargo-type', cargoTypeRoutes);
app.use('/freight', freightRoutes);
app.use('/freight-status-type', freightStatusTypeRoutes);
app.use('/proposal', proposalRoutes);
app.use('/proposal-status-type', proposalStatusTypeRoutes);

app.use(ErrorHandlerMiddleware);

export default app;
