import User from '../models/user.model';
import CnhType from '../models/cnh.model';
import { createAccountRpc } from '../messaging/account.rpc';
import { getUserImage } from '../http/storage.http';
import { isSuccess } from '../shared/rpc.types';
import { Request, Response } from 'express';
import { createUserSchema, updateUserSchema, createUserEndAccountSchema } from '../schemas/user.schemas';
import { translation } from '../utils/i18n';
import { getLocaleFromRequest } from '../utils/locale';
import { handleZodError } from '../utils/zodError';
import { sendError } from '../utils/httpResponse';
import { Op } from 'sequelize';

const uniqueFields = ['email', 'phoneNumber', 'cpf', 'cnhNumber'] as const;
type UniqueField = (typeof uniqueFields)[number];

const conflictMessageByField: Record<UniqueField, string> = {
	email: 'USER.EMAIL_ALREADY_EXISTS',
	phoneNumber: 'USER.PHONE_ALREADY_EXISTS',
	cpf: 'USER.CPF_ALREADY_EXISTS',
	cnhNumber: 'USER.CNH_NUMBER_ALREADY_EXISTS',
};

const getUniqueConflicts = (payload: Partial<Record<UniqueField, unknown>>, users: User[]) => {
	return uniqueFields.filter((field) => {
		const value = payload[field];
		if (value === undefined) return false;
		return users.some((user) => user.get(field) === value);
	});
};

export const createUser = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const body = createUserSchema.parse(req.body);

		const existingUsers = await User.findAll({
			where: {
				[Op.or]: [
					{ email: body.email },
					{ phoneNumber: body.phoneNumber },
					{ cpf: body.cpf },
					{ cnhNumber: body.cnhNumber },
				],
			},
		});
		const conflicts = getUniqueConflicts(body, existingUsers);
		if (conflicts.length > 0) {
			const conflictMessages = await Promise.all(
				conflicts.map((field) => translation(conflictMessageByField[field], locale)),
			);
			return sendError(res, 409, await translation('USER.ALREADY_EXISTS', locale), {
				conflicts,
				conflictMessages,
			});
		}

		await User.create(body);
		return res.status(201).json({
			message: await translation('USER.CREATED_SUCCESSFULLY', locale),
		});
	} catch (error) {
		const zodError = await handleZodError(error, locale);
		if (zodError) return res.status(zodError.status).json(zodError.body);

		return sendError(res, 500, await translation('USER.CREATE_FAILED', locale));
	}
};

export const getUserById = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const user = await User.findOne({
			where: { id: req.params.id },
			include: [{ model: CnhType, required: false }],
		});

		if (!user) {
			return sendError(res, 404, await translation('USER.NOT_FOUND', locale));
		}

		const userImage = user.userImage_id ? await getUserImage(user.userImage_id) : null;
		const userData = user.toJSON();

		return res.status(200).json({
			...userData,
			UserImage: userImage,
		});
	} catch (error) {
		return sendError(res, 500, await translation('USER.GET_BY_ID_FAILED', locale), { error });
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
		return sendError(res, 500, await translation('USER.GET_ALL_FAILED', locale), { error });
	}
};

export const patchUser = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const body = updateUserSchema.parse(req.body);
		const user = await User.findByPk(req.params.id as string);
		if (!user) {
			return sendError(res, 404, await translation('USER.NOT_FOUND', locale));
		}

		const duplicateClauses = uniqueFields
			.filter((field) => body[field] !== undefined)
			.map((field) => ({ [field]: body[field] }));

		if (duplicateClauses.length > 0) {
			const existingUsers = await User.findAll({
				where: {
					id: { [Op.ne]: req.params.id },
					[Op.or]: duplicateClauses,
				},
			});

			const conflicts = getUniqueConflicts(body, existingUsers);
			if (conflicts.length > 0) {
				const conflictMessages = await Promise.all(
					conflicts.map((field) => translation(conflictMessageByField[field], locale)),
				);

				return sendError(res, 409, await translation('USER.ALREADY_EXISTS', locale), {
					conflicts,
					conflictMessages,
				});
			}
		}

		await user.update(body);
		return res.status(200).json({
			message: await translation('USER.UPDATED_SUCCESSFULLY', locale),
		});
	} catch (error) {
		const zodError = await handleZodError(error, locale);
		if (zodError) return res.status(zodError.status).json(zodError.body);

		return sendError(res, 500, await translation('USER.UPDATE_FAILED', locale), { error });
	}
};

export const updateUser = patchUser;

export const deleteUser = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const user = await User.findByPk(req.params.id as string);
		if (!user) {
			return sendError(res, 404, await translation('USER.NOT_FOUND', locale));
		}

		await user.destroy();
		return res.status(200).json({ message: await translation('USER.DELETED_SUCCESSFULLY', locale) });
	} catch (error) {
		return sendError(res, 500, await translation('USER.DELETE_FAILED', locale), { error });
	}
};

export const createUserEndAccount = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const body = createUserEndAccountSchema.parse(req.body);

		const exeistUser = await User.findOne({
			where: { email: body.email, },
		});
		if (exeistUser) {
			return sendError(res, 409, await translation('USER.EMAIL_ALREADY_EXISTS', locale));
		}

		const user = await User.create(body);

		if (!user.id) {
			await user.destroy();
			return sendError(res, 500, await translation('USER.CREATE_FAILED', locale));
		}

		const account = await createAccountRpc({
			email: body.email,
			password: body.password,
			subject_id: user.id,
			account_type_id: body.account_type_id,
		});

		if (!isSuccess(account)) {
			await user.destroy();
			return sendError(res, 500, await translation('USER.CREATE_FAILED', locale));
		}

		return res.status(201).json({
			message: await translation('USER.CREATED_WITH_ACCOUNT_SUCCESSFULLY', locale),
		});
	} catch (error) {
		const zodError = await handleZodError(error, locale);
		if (zodError) return res.status(zodError.status).json(zodError.body);

		return sendError(res, 500, await translation('USER.CREATE_FAILED', locale), { error });
	}
};
