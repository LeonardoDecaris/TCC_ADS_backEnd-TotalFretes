import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import CompanyAddress from './address.model';

export class Company extends Model {
	id?: number;
	name?: string;
	email?: string;
	birthDate?: Date;
	phoneNumber?: string;
	website?: string;
	cnpj?: string;
	company_image_id?: number;
	companyAddress_id?: number;
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
	birthFundation: {
		type: DataTypes.DATE,
		allowNull: false,
	},
	phoneNumber: {
		type: DataTypes.STRING,
		allowNull: true,
	},
	website: {
		type: DataTypes.STRING,
		allowNull: true
	},
	cnpj: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
	},
	company_image_id: {
		type: DataTypes.INTEGER,
		allowNull: true,
	},
	companyAddress_id: {
		type: DataTypes.INTEGER,
		allowNull: true,
	}
}, {
	sequelize,
	tableName: 'company',
	timestamps: true,
});

Company.belongsTo(CompanyAddress, { foreignKey: 'companyAddress_id' });

export default Company;