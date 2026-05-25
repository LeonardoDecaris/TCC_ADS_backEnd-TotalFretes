import { Sequelize } from "sequelize";

const dbPort = process.env.DB_PORT != null && process.env.DB_PORT !== "" ? Number(process.env.DB_PORT) : undefined;

const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASS!,
  {
    host: process.env.DB_HOST!,
    dialect: "mysql",
    logging: false,
    ...(dbPort != null && !Number.isNaN(dbPort) ? { port: dbPort } : {}),
  }
);

export default sequelize;
