import express from 'express';
import cors from 'cors';
import { apiDocs } from './api-docs';
import mapBox from './routes/mapBox.routes';
import telemetry from './routes/telemetry.routes';
import { requestIdMiddleware, requestLoggerMiddleware } from './config/logging';
import { ErrorHandlerMiddleware } from './middlewares/errors';
import { logger } from './config/logging';

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);

app.get('/health', (_req, res) => res.status(200).json({ status: 'OK' }));
app.get('/api-docs', (_req, res) => res.json(apiDocs));

app.use(mapBox);
app.use(telemetry);

app.use(ErrorHandlerMiddleware);

export default app;

export { logger };
