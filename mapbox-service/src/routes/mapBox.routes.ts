import express from 'express';

import { geocodeForward, geocodeReverse, getMapBoxRoute } from '../controllers/mapBox.controller';

const router = express.Router();

router.get('/api/rota-frete', getMapBoxRoute);
router.get('/api/geocode-forward', geocodeForward);
router.get('/api/geocode-reverse', geocodeReverse);

export default router;