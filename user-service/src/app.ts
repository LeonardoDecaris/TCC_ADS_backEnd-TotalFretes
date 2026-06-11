import cors from 'cors';
import express from 'express';

import { apiDocs } from './api-docs';
import userRoutes from './routes/user.routes';
import cnhRoutes from './routes/cnh.routes';
import groupVehicleTypeRoutes from './routes/groupVehicleType.routes';
import vehicleTypeRoutes from './routes/vehicleType.routes';
import vehicleRoutes from './routes/vehicle.routes';
import internalSeedRoutes from './routes/internalSeed.routes';
import { requestIdMiddleware, requestLoggerMiddleware } from './config/logging';
import { ErrorHandlerMiddleware } from './middlewares/errors';

const app = express();
app.use(cors());
app.use(express.json());
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);

app.get('/', (_req, res) => {
  res.send('User Service is running');
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', PID: process.pid });
});

app.get('/api-docs', (_req, res) => res.json(apiDocs));

app.use('/user', userRoutes);
app.use('/cnh', cnhRoutes);
app.use('/group-vehicle-type', groupVehicleTypeRoutes);
app.use('/vehicle-type', vehicleTypeRoutes);
app.use('/vehicle', vehicleRoutes);
app.use('/internal/seed', internalSeedRoutes);

app.use(ErrorHandlerMiddleware);

export default app;
