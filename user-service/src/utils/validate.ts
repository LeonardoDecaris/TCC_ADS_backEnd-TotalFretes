import { Request, Response } from 'express';
import { z } from 'zod';

/**
 * Valida o body da requisição contra um schema Zod.
 * Em sucesso: retorna os dados parseados (tipados).
 * Em falha: envia 400 com erros formatados e retorna undefined.
 */
export function validateBody<T>(
	req: Request,
	res: Response,
	schema: z.ZodType<T>
): T | undefined {
	const result = schema.safeParse(req.body);

	if (result.success) {
		return result.data;
	}

	const errors = result.error.flatten();
	const fieldErrors = errors.fieldErrors as Record<string, string[] | undefined>;

	res.status(400).json({
		message: 'Erro de validação',
		details: fieldErrors,
	});

	return undefined;
}
