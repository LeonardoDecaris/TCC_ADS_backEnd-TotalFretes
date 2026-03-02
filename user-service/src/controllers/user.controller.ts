import axios from "axios";
import { Request, Response } from "express";

import User from "../models/user.model";
import CnhType from "../models/cnh.model";
import { validateBody } from "../utils/validate";
import { createUserSchema, updateUserSchema, createUserEndAccountSchema } from "../schemas/user.schemas";

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "";

export const createUser = async (req: Request, res: Response) => {
	const body = validateBody(req, res, createUserSchema);
	if (!body) return;

	try {
		const user = await User.create(body);
		return res.status(201).json({ message: "Usuário criado com sucesso", user });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Erro ao criar usuário" });
	}
};

export const getUserById = async (req: Request, res: Response) => {
	try {
		const user = await User.findOne({
			where: { id: req.params.id as string },
			include: [{
				model: CnhType,
				attributes: ['id', 'name']
			}],
		});

		if (!user) {
			return res.status(404).json({ message: "Usuário não encontrado" });
		}

		return res.status(200).json(user);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Erro ao buscar usuário" });
	}
};

export const getAllUsers = async (req: Request, res: Response) => {
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
		return res.status(500).json({ message: "Erro ao buscar usuários" });
	}
};

export const pacheUser = async (req: Request, res: Response) => {
	const body = validateBody(req, res, updateUserSchema);
	if (!body) return;

	try {
		const user = await User.findByPk(req.params.id as string);
		if (!user) {
			return res.status(404).json({ message: "Usuário não encontrado" });
		}
		await user.update(body);
		return res.status(200).json({ message: "Usuário atualizado com sucesso", user });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Erro ao atualizar usuário" });
	}
};

export const updateUser = async (req: Request, res: Response) => {
	const body = validateBody(req, res, updateUserSchema);
	if (!body) return;

	try {
		const user = await User.findByPk(req.params.id as string);
		if (!user) {
			return res.status(404).json({ message: "Usuário não encontrado" });
		}
		await user.update(body);
		return res.status(200).json({ message: "Usuário atualizado com sucesso", user });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Erro ao atualizar usuário" });
	}
};

export const deleteUser = async (req: Request, res: Response) => {
	try {
		const user = await User.findByPk(req.params.id as string);

		if (!user) {
			return res.status(404).json({ message: "Usuário não encontrado" });
		}

		await user.destroy();
		return res.status(200).json({ message: "Usuário deletado com sucesso" });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Erro ao deletar usuário" });
	}
};

export const createUserEndAccount = async (req: Request, res: Response) => {
	const body = validateBody(req, res, createUserEndAccountSchema);
	if (!body) return;

	try {
		const user = await User.create(body);

		const respondeAccount = await axios.post(`${AUTH_SERVICE_URL}/auth/account`, {
			email: body.email,
			password: body.password,
			subject_id: user.id,
			account_type_id: 1,
		});

		if (!respondeAccount.data.ok) {
			await user.destroy();
			return res.status(500).json({ message: "Erro ao criar conta de usuário" });
		}

		return res.status(201).json({ message: "Usuário e conta criados com sucesso", user });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Erro ao criar usuário" });
	}
};