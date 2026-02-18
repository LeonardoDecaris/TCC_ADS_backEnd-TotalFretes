import cors from "cors";
import express from 'express';

import { apiDocs } from './api-docs';
import companyRoutes from './routes/company.routes';
import addressRoutes from './routes/address.routes';


const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => { res.send("Hello World!"); });
app.get('/api-docs', (_req, res) => res.json(apiDocs));

app.use('/company', companyRoutes);
app.use('/address', addressRoutes);

export default app; 