import { DataTypes, Model, NonAttribute } from 'sequelize';
import sequelize from '../config/database';
import AccountType from './accounts_types.model';

export class Account extends Model {
	id?: number;
	email?: string;
	password?: string;
	account_type_id?: number;
	subject_id?: number;
	created_at?: Date;
	updated_at?: Date;
	userUpdate_at?: Date;

	AccountType?: NonAttribute<AccountType>;
}

Account.init({
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	email: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
	},
	password: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	account_type_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	subject_id: {
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
	tableName: 'accounts',
	timestamps: false,
});

Account.belongsTo(AccountType, { foreignKey: 'account_type_id' });

export default Account;
