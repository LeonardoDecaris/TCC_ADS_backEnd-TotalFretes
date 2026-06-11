import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export type ImageOutboxStatus = 'PENDING' | 'PUBLISHED' | 'FAILED';

class ImageOutboxEvent extends Model {
  id?: number;
  eventId?: string;
  eventType?: string;
  imageKind?: string;
  imageId?: number;
  payload?: Record<string, unknown>;
  status?: ImageOutboxStatus;
  attempts?: number;
  lastError?: string | null;
  publishedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

ImageOutboxEvent.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    eventId: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    eventType: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    imageKind: {
      type: DataTypes.STRING(32),
      allowNull: false,
    },
    imageId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    payload: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'PUBLISHED', 'FAILED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    lastError: {
      type: DataTypes.STRING(512),
      allowNull: true,
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'IMAGE_OUTBOX_EVENTS',
    timestamps: true,
  },
);

export default ImageOutboxEvent;
