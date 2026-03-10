import cors from "cors";
import express from 'express';

import { apiDocs } from './api-docs';
import userRoutes from './routes/user.routes';
import cnhRoutes from './routes/cnh.routes';
import groupVehicleTypeRoutes from './routes/groupVehicleType.routes';
import vehicleTypeRoutes from './routes/vehicleType.routes';
import vehicleRoutes from './routes/vehicle.routes';


const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => { res.send("Hello World!"); });
app.get('/api-docs', (_req, res) => res.json(apiDocs));

app.use('/user', userRoutes);
app.use('/cnh', cnhRoutes);
app.use('/group-vehicle-type', groupVehicleTypeRoutes);
app.use('/vehicle-type', vehicleTypeRoutes);
app.use('/vehicle', vehicleRoutes);

export default app;