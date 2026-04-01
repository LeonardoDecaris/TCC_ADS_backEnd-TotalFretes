import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import VehicleType from './vehicleType.model';

export class Vehicle extends Model {
	id: number | undefined;
	plateNumber: string | undefined;
	chassisNumber: string | undefined;
	model: string | undefined;
	mark: string | undefined;
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
		defaultValue: '',
	},
	model: {
		type: DataTypes.STRING,
		allowNull: true,
	},
	mark: {
		type: DataTypes.STRING,
		allowNull: true,
	},
	city: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	stateUF: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	country: {
		type: DataTypes.STRING,
		allowNull: false,
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