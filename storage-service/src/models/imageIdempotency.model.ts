import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class ImageIdempotency extends Model {
  id?: number;
  key?: string;
  scope?: string;
  userId?: number;
  fingerprint?: string;
  statusCode?: number;
  responseBody?: Record<string, unknown> | null;
  createdAt?: Date;
  updatedAt?: Date;
}

ImageIdempotency.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    scope: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fingerprint: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    statusCode: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    responseBody: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'IMAGE_IDEMPOTENCY',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['key', 'scope', 'userId'],
      },
    ],
  },
);

export default ImageIdempotency;
