import { Router, Request, Response } from 'express';

import { internalServiceMiddleware } from '../middleware/internalServiceMiddleware';
import { listDemoDriversForSeed, seedDemoDrivers } from '../config/seedDemoDrivers';
import { logger } from '../config/logging';

const router = Router();

router.use(internalServiceMiddleware);

router.get('/drivers', async (_req: Request, res: Response) => {
	try {
		const drivers = await listDemoDriversForSeed();
		return res.status(200).json(drivers);
	} catch (error) {
		logger.error('Failed to list demo drivers for seed', error);
		return res.status(500).json({ message: 'Failed to list demo drivers' });
	}
});

router.post('/run', async (_req: Request, res: Response) => {
	try {
		const result = await seedDemoDrivers();
		return res.status(200).json(result);
	} catch (error) {
		logger.error('Failed to run demo drivers seed', error);
		return res.status(500).json({ message: 'Failed to run demo drivers seed' });
	}
});

export default router;
