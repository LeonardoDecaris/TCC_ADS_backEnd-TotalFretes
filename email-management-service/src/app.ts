import express, { Request, Response } from 'express';
import cors from 'cors';
import { requestIdMiddleware, requestLoggerMiddleware } from './config/logging';

const app = express();

app.use(express.json());
app.use(cors());
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).send('OK');
});

export default app;
