import User from '../models/user.model';
import CnhType from '../models/cnh.model';
import Vehicle from '../models/vehicle.model';
import VehicleType from '../models/vehicleType.model';
import { createAccountHttp, getUserImageHttp, deleteAccountHttp } from '../services/service';
import { Request, Response } from 'express';
import { createUserSchema, updateUserSchema, createUserEndAccountSchema } from '../schemas/user.schemas';
import { translation } from '../utils/i18n';
import { getLocaleFromRequest } from '../utils/locale';
import { handleZodError } from '../utils/zodError';
import { buildUserConflicts } from '../utils/buildConflicts';
import { sendError, sendConflictError } from '../services/httpResponse';
import { Op } from 'sequelize';
import type { UpdateUserInput } from '../schemas/user.schemas';

const UNIQUE_USER_FIELDS = ['email', 'phoneNumber', 'cnhNumber'] as const;

function buildUniqueUserConflictConditions(body: UpdateUserInput) {
	return UNIQUE_USER_FIELDS
		.filter((field) => body[field] !== undefined)
		.map((field) => ({ [field]: body[field] }));
}

function fieldsFromUniqueConditions(
	conditions: Array<Partial<Record<(typeof UNIQUE_USER_FIELDS)[number], string>>>,
): Array<(typeof UNIQUE_USER_FIELDS)[number]> {
	return conditions.flatMap((condition) =>
		Object.keys(condition) as Array<(typeof UNIQUE_USER_FIELDS)[number]>,
	);
}

export const createUser = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const body = createUserSchema.parse(req.body);

		const existingUser = await User.findOne({
			where: {
				[Op.or]: [
					{ email: body.email },
					{ phoneNumber: body.phoneNumber },
					{ cpf: body.cpf },
					{ cnhNumber: body.cnhNumber },
				],
			},
		});

		if (existingUser) {
			const conflicts = await buildUserConflicts(existingUser, body, locale);
			if (conflicts.length > 0) {
				return sendConflictError(res, 'USER.ALREADY_EXISTS', locale, conflicts);
			}
		}

		await User.create(body);
		return res.status(201).json({ message: await translation('USER.CREATED_SUCCESSFULLY', locale) });
	} catch (error) {
		if (await handleZodError(error, locale, res)) return;
		return sendError(res, 500, 'USER.CREATE_FAILED', locale, error);
	}
};

export const getUserById = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const user = await User.findOne({
			where: { id: req.params.id },
			include: [
				{ model: CnhType, required: false },
				{
					model: Vehicle,
					required: false,
					include: [{ model: VehicleType, required: false }],
				},
			],
		});

		if (!user) return sendError(res, 404, 'USER.NOT_FOUND', locale);

		const userImage = user.userImage_id ? await getUserImageHttp({ id: user.userImage_id }) : null;

		return res.status(200).json({ ...user.toJSON(), UserImage: userImage });
	} catch (error) {
		return sendError(res, 500, 'USER.GET_BY_ID_FAILED', locale, error);
	}
};

export const getAllUsers = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const users = await User.findAll({
			include: [{ model: CnhType, attributes: ['id', 'name'] }],
		});
		return res.status(200).json(users);
	} catch (error) {
		return sendError(res, 500, 'USER.GET_ALL_FAILED', locale, error);
	}
};

export const patchUser = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		if (Object.prototype.hasOwnProperty.call(req.body, 'cpf')) {
			return sendError(res, 400, 'USER.CPF_UPDATE_NOT_ALLOWED', locale);
		}

		const body = updateUserSchema.parse(req.body);

		const user = await User.findByPk(req.params.id as string);
		if (!user) return sendError(res, 404, 'USER.NOT_FOUND', locale);

		const uniqueConditions = buildUniqueUserConflictConditions(body);
		const existingUser = uniqueConditions.length > 0
			? await User.findOne({
				where: {
					id: { [Op.ne]: req.params.id },
					[Op.or]: uniqueConditions,
				},
			})
			: null;

		if (existingUser) {
			const conflicts = await buildUserConflicts(
				existingUser,
				body,
				locale,
				fieldsFromUniqueConditions(uniqueConditions),
			);
			if (conflicts.length > 0) {
				return sendConflictError(res, 'USER.ALREADY_EXISTS', locale, conflicts);
			}
		}

		await user.update(body);
		return res.status(200).json({ message: await translation('USER.UPDATED_SUCCESSFULLY', locale) });
	} catch (error) {
		if (await handleZodError(error, locale, res)) return;
		return sendError(res, 500, 'USER.UPDATE_FAILED', locale, error);
	}
};

export const updateUser = patchUser;

export const deleteUser = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const user = await User.findByPk(req.params.id as string);
		if (!user) return sendError(res, 404, 'USER.NOT_FOUND', locale);

		await deleteAccountHttp({ id: user.id! });
		await user.destroy();

		return res.status(200).json({ message: await translation('USER.DELETED_SUCCESSFULLY', locale) });
	} catch (error) {
		return sendError(res, 500, 'USER.DELETE_FAILED', locale, error);
	}
};

export const createUserEndAccount = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const body = createUserEndAccountSchema.parse(req.body);

		const existingUser = await User.findOne({
			where: {
				[Op.or]: [
					{ email: body.email },
					{ phoneNumber: body.phoneNumber },
					{ cpf: body.cpf },
					{ cnhNumber: body.cnhNumber },
				],
			},
		});
		if (existingUser) {
			const conflicts = await buildUserConflicts(existingUser, body, locale);
			if (conflicts.length > 0) {
				return sendConflictError(res, 'USER.ALREADY_EXISTS', locale, conflicts);
			}
		}

		const user = await User.create(body);

		if (!user.id) {
			await user.destroy();
			return sendError(res, 500, 'USER.CREATE_FAILED', locale);
		}

		const accountResult = await createAccountHttp({
			email: body.email,
			password: body.password,
			subject_id: user.id,
			account_type_id: body.account_type_id,
		});

		if (!accountResult.ok) {
			await user.destroy();
			if (accountResult.reason === 'exists') {
				return sendConflictError(res, 'USER.ALREADY_EXISTS', locale, [{
					field: 'email',
					message: await translation('USER.EMAIL_ALREADY_EXISTS', locale),
				}]);
			}
			return sendError(res, 500, 'USER.ACCOUNT_CREATE_FAILED', locale);
		}

		return res.status(201).json({ message: await translation('USER.CREATED_WITH_ACCOUNT_SUCCESSFULLY', locale) });
	} catch (error) {
		if (await handleZodError(error, locale, res)) return;
		return sendError(res, 500, 'USER.CREATE_FAILED', locale, error);
	}
};