import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface DriverLocationAttributes {
  id: number;
  freight_id: number;
  driver_id: number;
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  recorded_at: Date;
  created_at?: Date;
}

export type DriverLocationCreationAttributes = Optional<
  DriverLocationAttributes,
  'id' | 'speed' | 'heading' | 'created_at'
>;

export class DriverLocation extends Model<DriverLocationAttributes, DriverLocationCreationAttributes> {
  declare id: number;
  declare freight_id: number;
  declare driver_id: number;
  declare latitude: number;
  declare longitude: number;
  declare speed: number | null;
  declare heading: number | null;
  declare recorded_at: Date;
  declare readonly created_at: Date;
}

DriverLocation.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    freight_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    driver_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
    },
    speed: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    heading: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    recorded_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'driver_locations',
    timestamps: true,
    updatedAt: false,
    createdAt: 'created_at',
    indexes: [
      { name: 'idx_driver_locations_freight_recorded', fields: ['freight_id', 'recorded_at'] },
    ],
  },
);

export default DriverLocation;
