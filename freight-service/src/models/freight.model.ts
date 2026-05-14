import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import CargoType from './cargoTypes.model';
import FreightStatusType from './freightStatusTypes.model';

export class Freight extends Model {
	id: number | undefined;
	company_id: number | undefined;
	cargoType_id: number | undefined;
	origin_label: string | undefined;
	origin_lat: number | undefined;
	origin_lng: number | undefined;
	destination_label: string | undefined;
	destination_lat: number | undefined;
	destination_lng: number | undefined;
	status_id: number | undefined;
	assignedDriver_id: number | undefined;
	daysLimit: number | undefined;
	originalValue: number | undefined;
	finalValue: number | undefined;
	/** Peso da carga do frete (kg). */
	weight: number | undefined;
}

Freight.init({
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	company_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	cargoType_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	origin_label: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	origin_lat: {
		type: DataTypes.FLOAT,
		allowNull: false,
	},
	origin_lng: {
		type: DataTypes.FLOAT,
		allowNull: false,
	},
	destination_label: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	destination_lat: {
		type: DataTypes.FLOAT,
		allowNull: false,
	},
	destination_lng: {
		type: DataTypes.FLOAT,
		allowNull: false,
	},
	status_id: {
		type: DataTypes.INTEGER,
		allowNull: true,
	},
	assignedDriver_id: {
		type: DataTypes.INTEGER,
		allowNull: true,
	},
	daysLimit: {
		type: DataTypes.INTEGER,
		allowNull: true,
	},
	originalValue: {
		type: DataTypes.FLOAT,
		allowNull: false,
	},
	finalValue: {
		type: DataTypes.FLOAT,
		allowNull: true,
	},
	weight: {
		type: DataTypes.FLOAT,
		allowNull: true,
	},
}, {
	sequelize,
	tableName: 'freights',
	timestamps: true,
});

Freight.belongsTo(CargoType, { foreignKey: 'cargoType_id', as: 'cargo' });
Freight.belongsTo(FreightStatusType, { foreignKey: 'status_id', as: 'status' });
export default Freight;