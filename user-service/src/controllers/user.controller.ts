import axios from "axios";

import User from "../models/user.model";
import CnhType from "../models/cnh.model";
import { translateError } from "../utils/i18n";

const getLocaleFromRequest = (req: Request): string => {
    const xLocale = req.headers["x-locale"];
    if (typeof xLocale === "string" && xLocale.trim()) return xLocale;

    const acceptLanguage = req.headers["accept-language"];
    if (typeof acceptLanguage === "string" && acceptLanguage.trim()) {
        return acceptLanguage.split(",")[0].trim();
    }

    return "pt-BR";
};

export const createUser = async (req: Request, res: Response) => {
	try {
		const user = await User.create(req.body);
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

export const updateUser = async (req: Request, res: Response) => {
	try {
		const user = await User.findByPk(req.params.id as string);

		if (!user) {
			return res.status(404).json({ message: "Usuário não encontrado" });
		}
		
		await user.update(req.body);
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
	try {
		const user = await User.create(req.body);

		const respondeAccount = await axios.post(`${AUTH_SERVICE_URL}/auth/account`, {
			email: user.email,
			password: req.body.password,
			subject_id: user.id,
			account_type_id: 1
		});

		if(!respondeAccount.data.ok) {
			await user.destroy();
			return res.status(500).json({ message: "Erro ao criar conta de usuário" });
		}

		return res.status(201).json({ message: "Usuário e conta criados com sucesso", user });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Erro ao criar usuário" });
	}
};