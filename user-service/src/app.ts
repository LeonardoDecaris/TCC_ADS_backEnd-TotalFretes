import cors from "cors";
import express from 'express';

import { apiDocs } from './api-docs';
import userRoutes from './routes/user.routes';
import cnhRoutes from './routes/cnh.routes';


const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => { res.send("Hello World!"); });
app.get('/api-docs', (_req, res) => res.json(apiDocs));

app.use('/user', userRoutes);
app.use('/cnh', cnhRoutes);

export default app;