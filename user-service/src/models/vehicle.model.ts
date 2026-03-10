import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import VehicleType from './vehicleType.model';

export class Vehicle extends Model {
	id: number | undefined;
	plateNumber: string | undefined;
	chassisNumber: string | undefined;
	city: string | undefined;
	stateUF: string | undefined;
	country: string | undefined;
	vehicleType_id: number | undefined;
}

Vehicle.init({
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	plateNumber: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	chassisNumber: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
	},
	city: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	stateUF: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
	},
	country: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
	},
	vehicleType_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	}
}, {
	sequelize,
	tableName: 'vehicles',
	timestamps: true,
});

Vehicle.belongsTo(VehicleType, { foreignKey: 'vehicleType_id' });
export default Vehicle;