import express from 'express';
import cors from 'cors';
import mapBox from './routes/mapBox.routes';
import { requestLoggerMiddleware } from './middlewares/requestLogger';
import { ErrorHandlerMiddleware } from './middlewares/errors';
import { logger } from './config/logger';

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLoggerMiddleware);

app.get('/health', (_req, res) => res.status(200).json({ status: 'OK' }));

app.use(mapBox);

app.use(ErrorHandlerMiddleware);

export default app;

export { logger };
