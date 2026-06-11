import { Router, Request, Response } from 'express';

import CompanyImage from '../models/companyImage.model';
import { internalServiceMiddleware } from '../middleware/internalServiceMiddleware';
import { getDemoCargoImagesCatalog, seedDemoCargoImages } from '../config/seedDemoImages';
import { registerImageFromUploads } from '../services/seedImageFromBackup.service';
import { companyImagesUpload } from '../routes/catalogImages.routes';
import { logger } from '../config/logging';

const router = Router();

type CompanyImageBody = {
	companyId?: unknown;
	logoFile?: unknown;
};

function parseCompanyImageBody(body: CompanyImageBody): { companyId: number; logoFile: string } | null {
	const companyId = Number(body.companyId);
	const logoFile = typeof body.logoFile === 'string' ? body.logoFile.trim() : '';
	if (!Number.isInteger(companyId) || companyId <= 0 || logoFile.length === 0) {
		return null;
	}
	return { companyId, logoFile };
}

router.use(internalServiceMiddleware);

router.get('/cargo-images', async (_req: Request, res: Response) => {
	try {
		const items = await getDemoCargoImagesCatalog();
		return res.status(200).json(items);
	} catch (error) {
		logger.error('Failed to list demo cargo images', error);
		return res.status(500).json({ message: 'Failed to list demo cargo images' });
	}
});

router.post('/company-images', async (req: Request, res: Response) => {
	try {
		const parsed = parseCompanyImageBody(req.body as CompanyImageBody);
		if (!parsed) {
			return res.status(400).json({ message: 'Invalid payload' });
		}

		const { companyId, logoFile } = parsed;

		const result = await registerImageFromUploads({
			fileName: logoFile,
			originalName: logoFile,
			upload: companyImagesUpload,
			Model: CompanyImage,
			extraPayload: { companyId },
		});

		if (!result) {
			return res.status(404).json({ message: `Logo file not found: ${logoFile}` });
		}

		return res.status(result.created ? 201 : 200).json({
			companyImage: {
				id: result.id,
				originalName: result.originalName,
				fileName: result.fileName,
				companyId,
			},
		});
	} catch (error) {
		logger.error('Failed to register demo company image', error);
		return res.status(500).json({ message: 'Failed to register demo company image' });
	}
});

router.post('/run', async (_req: Request, res: Response) => {
	try {
		const result = await seedDemoCargoImages();
		return res.status(200).json(result);
	} catch (error) {
		logger.error('Failed to run demo image seed', error);
		return res.status(500).json({ message: 'Failed to run demo image seed' });
	}
});

export default router;
