import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class UserImage extends Model {
  id?: number;
  originalName?: string;
  fileName?: string;
  path?: string;
  mimeType?: string;
  sizeBytes?: number;
  ownerType?: 'USER' | 'COMPANY';
  ownerId?: number | null;
}

UserImage.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    originalName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sizeBytes: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    ownerType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'USER',
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'USER_IMAGES',
    timestamps: false,
  }
);

export default UserImage;
