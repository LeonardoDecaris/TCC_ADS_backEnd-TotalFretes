import express, { Request, Response } from 'express';
import cors from 'cors';
import { apiDocs } from './api-docs';

const app = express();

app.use(express.json());
app.use(cors());

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).send('OK');
});

app.get('/api-docs', (_req: Request, res: Response) => {
  res.json(apiDocs);
});

export default app;
