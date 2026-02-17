import { Request, Response } from "express";
import Company from "../models/company.model";

export const createCompany = async (req: Request, res: Response) => {
	try {
		const company = await Company.create(req.body);
		return res.status(201).json({ message: "Empresa criada com sucesso", company });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Erro ao criar empresa" });
	}
};

export const getCompanyById = async (req: Request, res: Response) => {
	try {
		const company = await Company.findByPk(req.params.id as string);
		if (!company) {
			return res.status(404).json({ message: "Empresa não encontrada" });
		}
		return res.status(200).json(company);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Erro ao buscar empresa" });
	}
};

export const getAllCompanies = async (req: Request, res: Response) => {
	try {
		const company = await Company.findAll();
		return res.status(200).json(company);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Erro ao buscar empresas" });
	}
};

export const updateCompany = async (req: Request, res: Response) => {
	try {
		const company = await Company.findByPk(req.params.id as string);
		if (!company) {
			return res.status(404).json({ message: "Empresa não encontrada" });
		}
		await company.update(req.body);
		return res.status(200).json({ message: "Empresa atualizada com sucesso", company });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Erro ao atualizar empresa" });
	}
};

export const deleteCompany = async (req: Request, res: Response) => {
	try {
		const company = await Company.findByPk(req.params.id as string);
		if (!company) {
			return res.status(404).json({ message: "Empresa não encontrada" });
		}
		await company.destroy();
		return res.status(200).json({ message: "Empresa deletada com sucesso" });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Erro ao deletar empresa" });
	}
};
