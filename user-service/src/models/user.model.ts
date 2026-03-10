import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import CnhType from './cnh.model';
import Vehicle from './vehicle.model';

export class User extends Model {
	id: number | undefined;
	name: string | undefined;
	email: string | undefined;
	birthDate: string | undefined;
	phoneNumber: string | undefined;
	cpf: string | undefined;
	sex: string | undefined;
	useGlasses: boolean | undefined;
	isDeficient: boolean | undefined;
	cnhNumber: string | undefined;
	cnhType_id: number | undefined;
	vehicle_id: number | undefined;
	userImage_id: number | undefined;
}

User.init({
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	email: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
	},
	birthDate: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	phoneNumber: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
	},
	cpf: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
	},
	sex: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	useGlasses: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
	},
	isDeficient: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
	},
	cnhNumber: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	cnhType_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	vehicle_id: {
		type: DataTypes.INTEGER,
		allowNull: true,
	},
	userImage_id: {
		type: DataTypes.INTEGER,
		allowNull: true,
	}
}, {
	sequelize,
	tableName: 'users',
	timestamps: true,
});

User.belongsTo(CnhType, { foreignKey: 'cnhType_id' });
User.belongsTo(Vehicle, { foreignKey: 'vehicle_id' });
export default User;