import cors from "cors";
import express from 'express';

import { apiDocs } from './api-docs';
import authRoutes from './routes/auth.routes';
import accountRoutes from './routes/account.routes';
import internalAccountRoutes from './routes/internalAccount.routes';

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => { res.send("Hello World!"); });
app.get('/api-docs', (_req, res) => res.json(apiDocs));
app.use('/auth', authRoutes);
app.use('/account', accountRoutes);
app.use('/internal/account', internalAccountRoutes);

export default app;