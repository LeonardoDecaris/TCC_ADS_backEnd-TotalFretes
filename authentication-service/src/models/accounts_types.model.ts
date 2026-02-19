import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export class AccountType extends Model {
	id?: number;
	name?: string;
}

AccountType.init({
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
		allowNull: false,
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
}, {
	sequelize,
	tableName: 'account_types',
	timestamps: true,
});

export default AccountType;