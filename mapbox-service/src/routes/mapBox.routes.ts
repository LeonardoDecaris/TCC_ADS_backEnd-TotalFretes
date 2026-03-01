import express from 'express';

import { getMapBoxRoute } from '../controllers/mapBox.controller';

const router = express.Router();

router.get('/api/rota-frete', getMapBoxRoute);

export default router