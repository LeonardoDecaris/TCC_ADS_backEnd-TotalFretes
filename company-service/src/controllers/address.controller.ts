import { Request, Response } from "express";
import CompanyAddress from "../models/address.model";

export const createCompanyAddress = async (req: Request, res: Response) => {
	try {
		const companyAddress = await CompanyAddress.create(req.body);
		return res.status(201).json({ message: "Endereço da empresa criado com sucesso", companyAddress });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Erro ao criar endereço da empresa" });
	}
};

export const getAllCompanyAddresses = async (req: Request, res: Response) => {
	try {
		const companyAddresses = await CompanyAddress.findAll();
		return res.status(200).json(companyAddresses);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Erro ao buscar endereços da empresa" });
	}
};

export const getCompanyAddressById = async (req: Request, res: Response) => {
	try {
		const companyAddress = await CompanyAddress.findByPk(req.params.id as string);
		if (!companyAddress) {
			return res.status(404).json({ message: "Endereço da empresa não encontrado" });
		}
		return res.status(200).json(companyAddress);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Erro ao buscar endereço da empresa" });
	}
};

export const updateCompanyAddress = async (req: Request, res: Response) => {
	try {
		const companyAddress = await CompanyAddress.findByPk(req.params.id as string);
		if (!companyAddress) {
			return res.status(404).json({ message: "Endereço da empresa não encontrado" });
		}
		await companyAddress.update(req.body);
		return res.status(200).json({ message: "Endereço da empresa atualizado com sucesso", companyAddress });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Erro ao atualizar endereço da empresa" });
	}
};

export const deleteCompanyAddress = async (req: Request, res: Response) => {
	try {
		const companyAddress = await CompanyAddress.findByPk(req.params.id as string);
		if (!companyAddress) {
			return res.status(404).json({ message: "Endereço da empresa não encontrado" });
		}
		await companyAddress.destroy();
		return res.status(200).json({ message: "Endereço da empresa deletado com sucesso" });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Erro ao deletar endereço da empresa" });
	}
};