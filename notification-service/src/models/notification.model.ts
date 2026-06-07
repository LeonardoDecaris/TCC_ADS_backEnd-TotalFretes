import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface NotificationAttributes {
  id: number;
  user_id: number;
  type: string;
  title: string;
  body: string;
  metadata: Record<string, unknown> | null;
  read_at: Date | null;
  created_at?: Date;
}

export type NotificationCreationAttributes = Optional<
  NotificationAttributes,
  'id' | 'metadata' | 'read_at' | 'created_at'
>;

export class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> {
  declare id: number;
  declare user_id: number;
  declare type: string;
  declare title: string;
  declare body: string;
  declare metadata: Record<string, unknown> | null;
  declare read_at: Date | null;
  declare readonly created_at: Date;
}

Notification.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'notifications',
    timestamps: true,
    updatedAt: false,
    createdAt: 'created_at',
    indexes: [
      { name: 'idx_notifications_user_unread', fields: ['user_id', 'read_at'] },
      { name: 'idx_notifications_user_created', fields: ['user_id', 'created_at'] },
    ],
  },
);

export default Notification;
