import { NextFunction, Request, Response } from 'express';
import Company from '../models/company.model';
import { getLocaleFromRequest } from '../utils/locale';
import { sendError } from '../services/httpResponse';

declare global {
	namespace Express {
		interface Request {
			paymentCompany?: Company;
		}
	}
}

export const paymentTokenMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const locale = getLocaleFromRequest(req);
	const authHeader = req.headers.authorization?.trim();

	if (!authHeader?.startsWith('Bearer ')) {
		return sendError(res, 401, 'COMPANY.PAYMENT_TOKEN_INVALID', locale);
	}

	const token = authHeader.slice('Bearer '.length).trim();
	const parsed = Company.parsePaymentToken(token);

	if (!parsed) {
		return sendError(res, 401, 'COMPANY.PAYMENT_TOKEN_INVALID', locale);
	}

	const company = await Company.findByPk(parsed.companyId);

	if (!company) {
		return sendError(res, 401, 'COMPANY.PAYMENT_TOKEN_INVALID', locale);
	}

	if (company.isPaid) {
		req.paymentCompany = company;
		return next();
	}

	const isValid = await company.verifyPaymentToken(token);

	if (!isValid) {
		return sendError(res, 401, 'COMPANY.PAYMENT_TOKEN_INVALID', locale);
	}

	req.paymentCompany = company;
	return next();
};
