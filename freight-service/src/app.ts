import cors from "cors";
import express from 'express';

import { apiDocs } from './api-docs';
import cargoTypeRoutes from './routes/cargoTypes.routes';
import freightRoutes from './routes/freight.routes';
import freightStatusTypeRoutes from './routes/freightStatusTypes.routes';
import proposalRoutes from './routes/proposals.routes';
import proposalStatusTypeRoutes from './routes/proposalsStatusTypes.routes';


const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => { res.send("Hello World!"); });
app.get('/api-docs', (_req, res) => res.json(apiDocs));

app.use('/cargo-type', cargoTypeRoutes);
app.use('/freight', freightRoutes);
app.use('/freight-status-type', freightStatusTypeRoutes);
app.use('/proposal', proposalRoutes);
app.use('/proposal-status-type', proposalStatusTypeRoutes);

export default app;