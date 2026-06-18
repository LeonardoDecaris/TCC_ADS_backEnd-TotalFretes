import { Router, Request, Response } from 'express';
import { Op } from 'sequelize';
import { DEMO_FREIGHT_NAME_PREFIX } from '../config/freights.constants';

import Freight from '../models/freight.model';
import { internalServiceMiddleware } from '../middlewares/internalServiceMiddleware';
import { logger } from '../config/logging';

const router = Router();

router.use(internalServiceMiddleware);

router.get('/freights', async (_req: Request, res: Response) => {
	try {
		const freights = await Freight.findAll({
			attributes: ['id', 'name', 'assignedDriver_id'],
			where: {
				name: {
					[Op.like]: `${DEMO_FREIGHT_NAME_PREFIX}%`,
				},
			},
		});

		return res.status(200).json(
			freights
				.filter((freight) => typeof freight.name === 'string' && freight.name.length > 0)
				.map((freight) => ({
					id: freight.id!,
					name: freight.name!,
					assignedDriver_id: freight.assignedDriver_id ?? null,
				})),
		);
	} catch (error) {
		logger.error('Failed to list demo freights for seed', error);
		return res.status(500).json({ message: 'Failed to list demo freights' });
	}
});

export default router;
