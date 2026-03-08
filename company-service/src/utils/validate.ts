import { Request, Response } from "express";
import { z } from "zod";
import { getLocaleFromRequest } from "./locale";
import { translation } from "./i18n";

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

	const locale = getLocaleFromRequest(req);
	const message = await translation("VALIDATION.ERROR", locale);

	const translatedDetails: Record<string, string[]> = {};
	for (const [field, messages] of Object.entries(fieldErrors ?? {})) {
		if (!messages) continue;
		translatedDetails[field] = await Promise.all(
			messages.map((msg) => translation(msg, locale))
		);
	}

	res.status(400).json({
		message,
		details: translatedDetails,
	});

	return undefined;
}

