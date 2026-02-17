import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import CnhType from './cnh.model';

export class User extends Model {
	id?: number;
	name?: string;
	email?: string;
	birthDate?: Date;
	phoneNumber?: string;
	cpf?: string;
	sex?: string;
	useGlasses?: boolean;
	isDeficient?: boolean;
	cnhNumber?: string;
	cnhType_id?: number;  // Foreign key to CnhType
	vehicleType_id?: number;  // Foreign key to VehicleType (from vehicle-service)
	userImage_id?: number;  // Foreign key to UserImage (from image-service)
	created_at?: Date;
	updated_at?: Date;
	userUpdate_at?: Date;
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