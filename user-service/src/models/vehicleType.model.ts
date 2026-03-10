import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import GroupVehicleType from './groupVehicleType.model';

export class VehicleType extends Model {
	id: number | undefined;
	nome: string | undefined;
	axes: number | undefined;
	weight: number | undefined;
	capacityWeight: number | undefined;
	length: number | undefined;
	imageVehicle_id: number | undefined;
	groupVehicleType_id: number | undefined;
}

VehicleType.init({
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	nome: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	axes: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	weight: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	capacityWeight: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	length: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	imageVehicle_id: {
		type: DataTypes.INTEGER,
		allowNull: true,
	},
	groupVehicleType_id: {
		type: DataTypes.INTEGER,
		allowNull: true,
	}
}, {
	sequelize,
	tableName: 'vehicle_types',
	timestamps: true,
});

VehicleType.belongsTo(GroupVehicleType, { foreignKey: 'groupVehicleType_id' });
export default VehicleType;