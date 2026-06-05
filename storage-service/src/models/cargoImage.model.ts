import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class CargoImage extends Model {
  id?: number;
  originalName?: string;
  fileName?: string;
  path?: string;
  mimeType?: string;
  sizeBytes?: number;
}

CargoImage.init(
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
  },
  {
    sequelize,
    tableName: 'CARGO_IMAGES',
    timestamps: false,
  },
);

export default CargoImage;
