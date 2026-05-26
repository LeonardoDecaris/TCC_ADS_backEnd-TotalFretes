import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

export async function ensureUserImageOwnershipColumns(): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();
  const table = await queryInterface.describeTable('USER_IMAGES');

  if (!table.ownerType) {
    await queryInterface.addColumn('USER_IMAGES', 'ownerType', {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'USER',
    });
  }

  if (!table.ownerId) {
    await queryInterface.addColumn('USER_IMAGES', 'ownerId', {
      type: DataTypes.INTEGER,
      allowNull: true,
    });
  }
}
