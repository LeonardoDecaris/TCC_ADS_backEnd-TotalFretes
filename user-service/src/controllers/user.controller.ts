import { Request, Response } from "express";
import User from "../models/user.model";

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
		const user = await User.findByPk(req.params.id as string);
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
		const user = await User.findAll();
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

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;

export const createUserEndAccount = async (req: Request, res: Response) => {
    try {
        // 1) Cria usuário no user-service
        const user = await User.create(req.body);

        // 2) Envia para microserviço de autenticação com subject_id = user.id
        const authResponse = await fetch(`${AUTH_SERVICE_URL}/accounts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: req.body.email,
                password: req.body.password,
                subject_id: user.id,
                account_type: 1,
            }),
        });

        // 3) Se falhar no auth, desfaz usuário criado (compensação simples)
        if (!authResponse.ok) {
            await user.destroy();
            return res.status(502).json({ message: "Usuário criado, mas falhou ao criar conta no serviço de autenticação"});
        }

        return res.status(201).json({ message: "Usuário e conta criados com sucesso", user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro ao criar usuário" });
    }
};