import { Request, Response } from "express";
import axios from "axios";
import UserModel from "../models/authentication.model";
import { generateToken, verifyToken } from "../utils/jwt";

export const login = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body as { email?: string; password?: string };

		const emailNorm = email?.trim();

		if (!emailNorm) {
			return res.status(400).json({ message: "Email é obrigatório" });
		}

		if (!password) {
			return res.status(400).json({ message: "Senha é obrigatória" });
		}

		const user = await UserModel.findOne({ where: { email: emailNorm } });
		if (!user) {
			return res.status(400).json({ message: "Email incorreto" });
		}

		const isValidPassword = await user.validatePassword(password);
		if (!isValidPassword) {
			return res.status(400).json({ message: "Senha incorreta" });
		}

		const role = user.role!;
		const token = generateToken({ id: String(user.id!), role });
		return res.status(200).json({ message: "Login realizado com sucesso", token });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Erro interno do servidor" });
	}
};

export const register = async (req: Request, res: Response) => {
	try {
		const userServiceUrl = process.env.USER_SERVICE_URL;

		if (!userServiceUrl) {
			return res.status(500).json({
				message: "USER_SERVICE_URL configuration not found",
			});
		}

		const endpoint = `${userServiceUrl.replace(/\/$/, "")}/SingUpUser`;
		const response = await axios.post(endpoint, req.body, {
			headers: {
				"Content-Type": "application/json",
			},
		});

		return res.status(response.status).json(response.data);
	} catch (error: any) {
		if (axios.isAxiosError(error) && error.response) {
			return res.status(error.response.status).json(error.response.data);
		}

		console.error(error);
		return res.status(500).json({
			message: "Error to register user in user service",
		});
	}
};

export const verifyAuthToken = async (req: Request, res: Response) => {
	try {
		const token = req.headers.authorization?.split(" ")[1];
		if (!token) {
			return res.status(401).json({ message: "Token not provided" });
		}
		const decoded = verifyToken(token);
		return res.status(200).json({ message: "Token valid", valid: true, user: decoded });
	} catch (error) {
		console.error(error);
		return res.status(401).json({ message: "Token invalid" });
	}
};
