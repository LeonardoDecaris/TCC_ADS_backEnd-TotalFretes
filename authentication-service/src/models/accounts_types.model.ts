import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export class AccountType extends Model {
	id?: number;
	name?: string;
	created_at?: Date;
	updated_at?: Date;
	userUpdate_at?: Date;
}

AccountType.init({
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	name: {
		type: DataTypes.STRING,
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
	tableName: 'account_types',
	timestamps: false,
});

export default AccountType;