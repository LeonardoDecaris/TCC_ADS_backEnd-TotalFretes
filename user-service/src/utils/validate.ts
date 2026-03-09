import { Request, Response } from 'express';
import { z } from 'zod';
import { getLocaleFromRequest } from './locale';
import { translation } from './i18n';

/** Schema Zod para parâmetro de rota :id (inteiro positivo) */
export const idParamSchema = z.object({
	id: z.coerce.number().int().positive('VALIDATION.ID_INVALID'),
});

/**
 * Valida o body da requisição contra um schema Zod.
 * Em sucesso: retorna os dados parseados (tipados).
 * Em falha: envia 400 com erros formatados e retorna undefined.
 */
export async function validateBody<T>(
	req: Request,
	res: Response,
	schema: z.ZodType<T>
): Promise<T | undefined> {
	const result = schema.safeParse(req.body);

	if (result.success) {
		return result.data;
	}

	const errors = result.error.flatten();
	const fieldErrors = errors.fieldErrors as Record<string, string[] | undefined>;
	const formErrors = errors.formErrors ?? [];

	const locale = getLocaleFromRequest(req);
	const genericMessage = await translation('VALIDATION.ERROR', locale);

	const translatedDetails: Record<string, string[]> = {};
	for (const [field, messages] of Object.entries(fieldErrors ?? {})) {
		if (!messages) continue;
		translatedDetails[field] = await Promise.all(
			messages.map((msg) => translation(msg, locale))
		);
	}

	const translatedFormErrors = await Promise.all(
		formErrors.map((msg) => translation(msg, locale))
	);

	const firstDetailMessage = Object.values(translatedDetails)[0]?.[0]
		?? translatedFormErrors[0];

	const message =
		genericMessage === 'VALIDATION.ERROR' && firstDetailMessage
			? firstDetailMessage
			: genericMessage;

	res.status(400).json({
		message,
		error: genericMessage,
		formErrors: translatedFormErrors,
		details: translatedDetails,
	});

	return undefined;
}

/**
 * Valida os parâmetros da requisição (req.params) contra um schema Zod.
 * Em sucesso: retorna os dados parseados (tipados).
 * Em falha: envia 400 e retorna undefined.
 */
export async function validateParams<T>(
	req: Request,
	res: Response,
	schema: z.ZodType<T>
): Promise<T | undefined> {
	const result = schema.safeParse(req.params);

	if (result.success) {
		return result.data;
	}

	const locale = getLocaleFromRequest(req);
	const message = await translation('VALIDATION.PARAMS_INVALID', locale);
	res.status(400).json({ message });
	return undefined;
}
