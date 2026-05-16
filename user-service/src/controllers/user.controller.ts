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
import { sendError, sendConflictError } from '../services/httpResponse';
import { Op } from 'sequelize';

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

		if (existingUser) return sendConflictError(res, 'USER.ALREADY_EXISTS', locale, [{
			field: 'email',
			message: await translation('USER.EMAIL_ALREADY_EXISTS', locale),
		}, {
			field: 'phoneNumber',
			message: await translation('USER.PHONE_ALREADY_EXISTS', locale),
		}, {
			field: 'cpf',
			message: await translation('USER.CPF_ALREADY_EXISTS', locale),
		}, {
			field: 'cnhNumber',
			message: await translation('USER.CNH_NUMBER_ALREADY_EXISTS', locale),
		}]);

		await User.create(body);
		return res.status(201).json({ message: await translation('USER.CREATED_SUCCESSFULLY', locale) });
	} catch (error) {
		if (await handleZodError(error, locale, res)) return;
		return sendError(res, 500, 'USER.CREATE_FAILED', locale);
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
		return sendError(res, 500, 'USER.GET_BY_ID_FAILED', locale);
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
		return sendError(res, 500, 'USER.GET_ALL_FAILED', locale);
	}
};

export const patchUser = async (req: Request, res: Response) => {
	const locale = getLocaleFromRequest(req);
	try {
		const body = updateUserSchema.parse(req.body);

		const user = await User.findByPk(req.params.id as string);
		if (!user) return sendError(res, 404, 'USER.NOT_FOUND', locale);

		const existingUser = await User.findOne({
			where: { id: { [Op.ne]: req.params.id }, [Op.or]: body },
		});

		if (existingUser) return sendConflictError(res, 'USER.ALREADY_EXISTS', locale, [{
			field: 'email',
			message: await translation('USER.EMAIL_ALREADY_EXISTS', locale),
		}, {
			field: 'phoneNumber',
			message: await translation('USER.PHONE_ALREADY_EXISTS', locale),
		}, {
			field: 'cpf',
			message: await translation('USER.CPF_ALREADY_EXISTS', locale),
		}, {
			field: 'cnhNumber',
			message: await translation('USER.CNH_NUMBER_ALREADY_EXISTS', locale),
		}]);

		await user.update(body);
		return res.status(200).json({ message: await translation('USER.UPDATED_SUCCESSFULLY', locale) });
	} catch (error) {
		if (await handleZodError(error, locale, res)) return;
		return sendError(res, 500, 'USER.UPDATE_FAILED', locale);
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
		return sendError(res, 500, 'USER.DELETE_FAILED', locale);
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
		if (existingUser) return sendConflictError(res, 'USER.ALREADY_EXISTS', locale, [{
			field: 'email',
			message: await translation('USER.EMAIL_ALREADY_EXISTS', locale),
		}, {
			field: 'phoneNumber',
			message: await translation('USER.PHONE_ALREADY_EXISTS', locale),
		}, {
			field: 'cpf',
			message: await translation('USER.CPF_ALREADY_EXISTS', locale),
		}, {
			field: 'cnhNumber',
			message: await translation('USER.CNH_NUMBER_ALREADY_EXISTS', locale),
		}]);

		const user = await User.create(body);

		if (!user.id) {
			await user.destroy();
			return sendError(res, 500, 'USER.CREATE_FAILED', locale);
		}

		const accountCreated = await createAccountHttp({
			email: body.email,
			password: body.password,
			subject_id: user.id,
			account_type_id: body.account_type_id,
		});

		if (!accountCreated) {
			await user.destroy();
			return sendError(res, 500, 'USER.CREATE_FAILED', locale);
		}

		return res.status(201).json({ message: await translation('USER.CREATED_WITH_ACCOUNT_SUCCESSFULLY', locale) });
	} catch (error) {
		if (await handleZodError(error, locale, res)) return;
		return sendError(res, 500, 'USER.CREATE_FAILED', locale);
	}
};