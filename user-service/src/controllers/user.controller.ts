import User from '../models/user.model';
import CnhType from '../models/cnh.model';
import { createAccountRpc } from '../messaging/account.rpc';
import { fetchUserImage } from '../http/storage.http';
import { deleteAuthAccountForUserSubject } from '../http/auth.http';
import { isSuccess } from '../shared/rpc.types';
import { Request, Response } from 'express';
import { ZodError } from 'zod';
import {
	createUserSchema,
	updateUserSchema,
	createUserEndAccountSchema,
} from '../schemas/user.schemas';
import { translation } from '../utils/i18n';
import { getLocaleFromRequest } from '../utils/locale';

export const createUser = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const body = createUserSchema.parse(req.body);

		const user = await User.create(body);
		return res.status(201).json({
			message: await translation('USER.CREATED_SUCCESSFULLY', locale),
			user,
		});
	} catch (error) {
		if (error instanceof ZodError) {
			return res.status(400).json({
				message: await translation('USER.CREATE_FAILED', locale),
				issues: error.issues,
			});
		}
		return res.status(500).json({
			message: await translation('USER.CREATE_FAILED', locale),
		});
	}
};

export const getUserById = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const user = await User.findOne({
			where: { id: req.params.id as string },
			include: [{ model: CnhType, required: false }],
		});

		if (!user) {
			return res.status(404).json({
				message: await translation('USER.NOT_FOUND', locale),
			});
		}

		const userData = user.toJSON() as Record<string, unknown> & {
			userImage_id?: number | null;
		};

		const userImage = userData.userImage_id ? await fetchUserImage(userData.userImage_id) : null;

		return res.status(200).json({
			...userData,
			UserImage: userImage,
		});
	} catch {
		return res.status(500).json({
			message: await translation('USER.GET_BY_ID_FAILED', locale),
		});
	}
};

export const getAllUsers = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const users = await User.findAll({
			include: [{ model: CnhType, attributes: ['id', 'name'] }],
		});
		return res.status(200).json(users);
	} catch {
		return res.status(500).json({
			message: await translation('USER.GET_ALL_FAILED', locale),
		});
	}
};

export const patchUser = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const body = updateUserSchema.parse(req.body);

		const user = await User.findByPk(req.params.id as string);
		if (!user) {
			return res.status(404).json({ message: await translation('USER.NOT_FOUND', locale) });
		}
		await user.update(body);
		return res.status(200).json({
			message: await translation('USER.UPDATED_SUCCESSFULLY', locale),
			user,
		});
	} catch {
		return res.status(500).json({ message: await translation('USER.UPDATE_FAILED', locale) });
	}
};

export const updateUser = patchUser;

export const deleteUser = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const user = await User.findByPk(req.params.id as string);
		if (!user) {
			return res.status(404).json({ message: await translation('USER.NOT_FOUND', locale) });
		}

		const userId = Number(user.id);
		const authDeleted = await deleteAuthAccountForUserSubject(userId);
		if (authDeleted === 'error') {
			return res.status(502).json({
				message: await translation('USER.DELETE_FAILED', locale),
			});
		}

		await user.destroy();
		return res.status(200).json({ message: await translation('USER.DELETED_SUCCESSFULLY', locale) });
	} catch {
		return res.status(500).json({ message: await translation('USER.DELETE_FAILED', locale) });
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
			return res.status(400).json({
				message: await translation('USER.EMAIL_ALREADY_EXISTS', locale),
			});
		}

		const user = await User.create(body);
		if (!user.id) {
			await user.destroy();
			return res.status(500).json({
				message: await translation('USER.CREATE_FAILED', locale),
			});
		}

		const account = await createAccountRpc({
			email: body.email,
			password: body.password,
			subject_id: user.id,
			account_type_id: body.account_type_id,
		});

		if (!isSuccess(account)) {
			await user.destroy();
			return res.status(500).json({
				message: await translation('USER.CREATE_FAILED', locale),
			});
		}

		return res.status(201).json({
			message: await translation('USER.CREATED_WITH_ACCOUNT_SUCCESSFULLY', locale),
		});
	} catch (error) {
		if (error instanceof ZodError) {
			return res.status(400).json({
				message: await translation('USER.CREATE_FAILED', locale),
				issues: error.issues,
			});
		}
		return res.status(500).json({ message: await translation('USER.CREATE_FAILED', locale) });
	}
};
