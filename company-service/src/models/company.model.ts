import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import CompanyAddress from './address.model';

export class Company extends Model {
	id?: number;
	name?: string;
	email?: string;
	birthDate?: Date;
	phoneNumber?: string;
	cnpj?: string;
	company_image_id?: number;
	vehicleType_id?: number;
	companyAddress_id?: number;
	created_at?: Date;
	updated_at?: Date;
	userUpdate_at?: Date;
}

Company.init({
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
	},
	cnpj: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
	},
	company_image_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	vehicleType_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	companyAddress_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	created_at: {
		type: DataTypes.DATE,
		allowNull: false,
		defaultValue: DataTypes.NOW,
	},
	updated_at: {
		type: DataTypes.DATE,
		allowNull: false,
		defaultValue: DataTypes.NOW,
	},
	userUpdate_at: {
		type: DataTypes.DATE,
		allowNull: false,
		defaultValue: DataTypes.NOW,
	},	
}, {
	sequelize,
	tableName: 'Company',
	timestamps: true,
});

Company.belongsTo(CompanyAddress, { foreignKey: 'companyAddress_id' });

export default Company;