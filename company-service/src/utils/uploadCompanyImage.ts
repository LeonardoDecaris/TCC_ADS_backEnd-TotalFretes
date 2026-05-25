import multer from 'multer';
import { Request, Response } from 'express';
import { getLocaleFromRequest } from './locale';
import { translation } from './i18n';

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const uploadCompanyImage = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 5 * 1024 * 1024,
	},
	fileFilter: (_req, file, cb) => {
		if (!imageMimeTypes.includes(file.mimetype)) {
			return cb(new Error('Arquivo inválido. Envie apenas imagens.'));
		}
		cb(null, true);
	},
});

export const handleCompanyImageUploadError = async (
	err: Error,
	req: Request,
	res: Response,
	next: (err?: unknown) => void,
) => {
	try {
		const locale = getLocaleFromRequest(req);

		if (err.message.includes('Arquivo inválido')) {
			return res.status(400).json({
				code: 'COMPANY_IMAGE.INVALID_FILE',
				message: await translation('COMPANY_IMAGE.INVALID_FILE', locale),
			});
		}

		if (err.message.toLowerCase().includes('file too large')) {
			return res.status(400).json({
				code: 'COMPANY_IMAGE.FILE_TOO_LARGE',
				message: await translation('COMPANY_IMAGE.FILE_TOO_LARGE', locale),
			});
		}

		return res.status(500).json({
			code: 'COMPANY_IMAGE.UPLOAD_PROCESS_FAILED',
			message: await translation('COMPANY_IMAGE.UPLOAD_PROCESS_FAILED', locale),
			error: err.message,
		});
	} catch (error) {
		next(error);
	}
};
