import { Router, Request, Response } from 'express';

import { internalServiceMiddleware } from '../middleware/internalServiceMiddleware';
import { listDemoCompaniesForSeed, seedDemoCompanies } from '../config/seedDemoCompanies';
import { logger } from '../config/logging';

const router = Router();

router.use(internalServiceMiddleware);

router.get('/companies', async (_req: Request, res: Response) => {
	try {
		const companies = await listDemoCompaniesForSeed();
		return res.status(200).json(companies);
	} catch (error) {
		logger.error('Failed to list demo companies for seed', error);
		return res.status(500).json({ message: 'Failed to list demo companies' });
	}
});

router.post('/run', async (_req: Request, res: Response) => {
	try {
		const result = await seedDemoCompanies();
		return res.status(200).json(result);
	} catch (error) {
		logger.error('Failed to run demo companies seed', error);
		return res.status(500).json({ message: 'Failed to run demo companies seed' });
	}
});

export default router;
