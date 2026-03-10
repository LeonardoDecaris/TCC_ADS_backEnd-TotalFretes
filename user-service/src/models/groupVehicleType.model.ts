import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import CnhType from './cnh.model';

export class GroupVehicleType extends Model {
	id: number | undefined;
	nome: string | undefined;
	cnhType_id: number | undefined;
}

GroupVehicleType.init({
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	nome: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	cnhType_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
}, {
	sequelize,
	tableName: 'group_vehicle_types',
	timestamps: true,
});

GroupVehicleType.belongsTo(CnhType, { foreignKey: 'cnhType_id' });
export default GroupVehicleType;