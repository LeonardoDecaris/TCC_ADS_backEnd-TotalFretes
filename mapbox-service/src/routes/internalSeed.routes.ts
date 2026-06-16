import { Router, Request, Response } from 'express';

import { seedDemoTelemetryTrails } from '../config/seedDemoTelemetry';
import { logger } from '../config/logging';
import { internalServiceMiddleware } from '../middlewares/internalServiceMiddleware';

const router = Router();

router.use(internalServiceMiddleware);

router.post('/run', async (_req: Request, res: Response) => {
	try {
		const result = await seedDemoTelemetryTrails();
		return res.status(200).json(result);
	} catch (error) {
		logger.error('Failed to run demo telemetry seed', error);
		return res.status(500).json({ message: 'Failed to run demo telemetry seed' });
	}
});

export default router;
