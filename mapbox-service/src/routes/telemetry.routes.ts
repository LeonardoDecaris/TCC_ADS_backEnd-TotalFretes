import express from 'express';
import { getDriverTrail, postDriverLocation } from '../controllers/telemetry.controller';
import { authMiddleware, authorizeRoles } from '../middleware/authMiddleware';

const router = express.Router();

router.post(
  '/api/telemetry/location',
  authMiddleware,
  authorizeRoles('USER'),
  postDriverLocation,
);

router.get(
  '/api/telemetry/trail/:freightId',
  authMiddleware,
  authorizeRoles('COMPANY', 'USER', 'ADMIN'),
  getDriverTrail,
);

export default router;
