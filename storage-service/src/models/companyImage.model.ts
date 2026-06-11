import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class CompanyImage extends Model {
  id?: number;
  originalName?: string;
  fileName?: string;
  path?: string;
  mimeType?: string;
  sizeBytes?: number;
  companyId?: number | null;
}

CompanyImage.init(
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
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'COMPANY_IMAGES',
    timestamps: false,
  },
);

export default CompanyImage;
