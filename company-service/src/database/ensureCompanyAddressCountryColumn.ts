import { DataTypes } from "sequelize";
import sequelize from "../config/database";

export async function ensureCompanyAddressCountryColumn(): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();
  const table = await queryInterface.describeTable("company_addresses");

  if (table.country) return;

  await queryInterface.addColumn("company_addresses", "country", {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "BR",
  });
}
