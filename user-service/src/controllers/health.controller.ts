import { Request, Response } from "express";
import sequelize from "../config/database";

export const health = async (_req: Request, res: Response) => {
  try {
    await sequelize.authenticate();
    return res.status(200).json({
      status: "up",
      database: "connected",
    });
  } catch (error) {
    console.error(error);
    return res.status(503).json({
      status: "down",
      database: "disconnected",
    });
  }
};
