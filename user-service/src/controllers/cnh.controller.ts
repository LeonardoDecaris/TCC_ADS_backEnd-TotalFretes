import { Request, Response } from "express";
import CnhType from "../models/cnh.model";

export const createCnhType = async (req: Request, res: Response) => {
	try {
		const cnhType = await CnhType.create(req.body);
		return res.status(201).json({ message: "CNH tipo criado com sucesso", cnhType });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Erro ao criar CNH tipo" });
	}
};

export const getAllCnhTypes = async (req: Request, res: Response) => {
	try {
		const cnhTypes = await CnhType.findAll();
		return res.status(200).json(cnhTypes);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Erro ao buscar CNH tipos" });
	}
};

export const getCnhTypeById = async (req: Request, res: Response) => {
	try {
		const cnhType = await CnhType.findByPk(req.params.id as string);
		if (!cnhType) {
			return res.status(404).json({ message: "CNH tipo não encontrado" });
		}
		return res.status(200).json(cnhType);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Erro ao buscar CNH tipo" });
	}
};

export const updateCnhType = async (req: Request, res: Response) => {
	try {
		const cnhType = await CnhType.findByPk(req.params.id as string);
		if (!cnhType) {
			return res.status(404).json({ message: "CNH tipo não encontrado" });
		}
		await cnhType.update(req.body);
		return res.status(200).json({ message: "CNH tipo atualizado com sucesso", cnhType });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Erro ao atualizar CNH tipo" });
	}
};

export const deleteCnhType = async (req: Request, res: Response) => {
	try {
		const cnhType = await CnhType.findByPk(req.params.id as string);
		if (!cnhType) {
			return res.status(404).json({ message: "CNH tipo não encontrado" });
		}
		await cnhType.destroy();
		return res.status(200).json({ message: "CNH tipo deletado com sucesso" });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Erro ao deletar CNH tipo" });
	}
};