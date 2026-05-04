import axios from "axios";
import { UniqueConstraintError } from "sequelize";
import User from "../models/user.model";
import { requestAccountCreationRpc } from "../messaging/account.rpc.client";
import CnhType from "../models/cnh.model";
import { Request, Response } from "express";
import { validateBody, validateParams, idParamSchema } from "../utils/validate";
import { createUserSchema, updateUserSchema, createUserEndAccountSchema } from "../schemas/user.schemas";
import { translation } from "../utils/i18n";
import { getLocaleFromRequest } from "../utils/locale";

const STORAGE_SERVICE_URL = process.env.STORAGE_SERVICE_URL ?? "http://storage-service:3007";

export const createUser = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	const body = await validateBody(req, res, createUserSchema);
	if (!body) return;

	try {
		const user = await User.create(body);
		return res.status(201).json({
			message: await translation("USER.CREATED_SUCCESSFULLY", locale),
			user,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation("USER.CREATE_FAILED", locale),
		});
	}
};

export const getUserById = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	const params = await validateParams(req, res, idParamSchema);
	if (!params) return;

	try {
		const user = await User.findOne({
			where: { id: params.id },
			include: [{
				model: CnhType,
				required: false,
			}],
		});

		if (!user) {
			return res.status(404).json({
				message: await translation("USER.NOT_FOUND", locale),
			});
		}

		const userData = user.toJSON() as Record<string, unknown> & { userImage_id?: number };
		let userImage: unknown = null;

		if (userData.userImage_id) {
			try {
				const { data } = await axios.get( `${STORAGE_SERVICE_URL}/user-images/${userData.userImage_id}`,
					{ timeout: 3000, headers: { "accept-language": locale } });
				userImage = data;
			} catch (imageError) {
				console.error("Error fetching user image from storage-service:", imageError);
			}
		}
		return res.status(200).json({
			...userData,
			UserImage: userImage,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation("USER.GET_BY_ID_FAILED", locale),
		});
	}
};

export const getAllUsers = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const user = await User.findAll({
			include: [{
				model: CnhType,
				attributes: ['id', 'name']
			}],
		});

		return res.status(200).json(user);
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation("USER.GET_ALL_FAILED", locale),
		});
	}
};

export const patchUser = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	const params = await validateParams(req, res, idParamSchema);
	if (!params) return;
	const body = await validateBody(req, res, updateUserSchema);
	if (!body) return;

	try {
		const user = await User.findByPk(params.id);
		if (!user) {
			return res.status(404).json({
				message: await translation("USER.NOT_FOUND", locale),
			});
		}
		await user.update(body);
		return res.status(200).json({
			message: await translation("USER.UPDATED_SUCCESSFULLY", locale),
			user,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation("USER.UPDATE_FAILED", locale),
		});
	}
};

export const updateUser = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	const params = await validateParams(req, res, idParamSchema);
	if (!params) return;
	const body = await validateBody(req, res, updateUserSchema);
	if (!body) return;

	try {
		const user = await User.findByPk(params.id);
		if (!user) {
			return res.status(404).json({
				message: await translation("USER.NOT_FOUND", locale),
			});
		}
		await user.update(body);
		return res.status(200).json({
			message: await translation("USER.UPDATED_SUCCESSFULLY", locale),
			user,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation("USER.UPDATE_FAILED", locale),
		});
	}
};

export const deleteUser = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	const params = await validateParams(req, res, idParamSchema);
	if (!params) return;

	try {
		const user = await User.findByPk(params.id);

		if (!user) {
			return res.status(404).json({
				message: await translation("USER.NOT_FOUND", locale),
			});
		}

		await user.destroy();
		return res.status(200).json({
			message: await translation("USER.DELETED_SUCCESSFULLY", locale),
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: await translation("USER.DELETE_FAILED", locale),
		});
	}
};

export const createUserEndAccount = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	const body = await validateBody(req, res, createUserEndAccountSchema);
	if (!body) return;

	try {
		const user = await User.create(body);
		const subjectId = user.id;
		if (subjectId == null) {
			await user.destroy();
			return res.status(500).json({
				message: await translation("USER.CREATE_FAILED", locale),
			});
		}

		const respondeAccount = await requestAccountCreationRpc({
			email: body.email,
			password: body.password,
			subject_id: subjectId,
			account_type_id: body.account_type_id,
		});

		if (!respondeAccount.ok) {
			await user.destroy();
			return res.status(500).json({
				message: await translation("USER.ACCOUNT_CREATE_FAILED", locale),
			});
		}

		return res.status(201).json({
			message: await translation("USER.CREATED_WITH_ACCOUNT_SUCCESSFULLY", locale),
			user,
		});
	} catch (error: unknown) {
		if (error instanceof UniqueConstraintError) {
			const emailDuplicate = error.errors.some((e) => e.path === "email");
			if (emailDuplicate) {
				return res.status(409).json({
					message: await translation("USER.EMAIL_ALREADY_EXISTS", locale),
				});
			}
		}
		console.error(error);
		return res.status(500).json({
			message: await translation("USER.CREATE_FAILED", locale),
		});
	}
};