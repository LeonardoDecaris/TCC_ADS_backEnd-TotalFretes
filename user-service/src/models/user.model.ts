import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import CnhType from './cnh.model';

export class User extends Model {
	id: number | undefined;
	name: string | undefined;
	email: string | undefined;
	birthDate: Date | undefined;
	phoneNumber: string | undefined;
	cpf: string | undefined;
	sex: string | undefined;
	useGlasses: boolean | undefined;
	isDeficient: boolean | undefined;
	cnhNumber: string | undefined;
	cnhType_id: number | undefined;
	vehicleType_id: number | undefined;
	userImage_id: number | undefined;
	created_at: Date | undefined;
	updated_at: Date | undefined;
	userUpdate_at: Date | undefined;
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
		type: DataTypes.DATE,
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
	vehicleType_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	userImage_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	created_at: {
		type: DataTypes.DATE,
		allowNull: false,
	},
	updated_at: {
		type: DataTypes.DATE,
		allowNull: false,
	},
	userUpdate_at: {
		type: DataTypes.DATE,
		allowNull: false,
	},
}, {
	sequelize,
	tableName: 'users',
	timestamps: true,
});

User.belongsTo(CnhType, { foreignKey: 'cnhType_id' });

export default User;