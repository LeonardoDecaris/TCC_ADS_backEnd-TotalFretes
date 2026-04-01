import { DataTypes, Model, NonAttribute } from 'sequelize';
import sequelize from '../config/database';
import AccountType from './accounts_types.model';

export class Account extends Model {
	id?: number;
	email?: string;
	password?: string;
	account_type_id?: number;
	subject_id?: number;

	AccountType?: NonAttribute<AccountType>;
}

Account.init({
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
		allowNull: false,
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
}, {
	sequelize,
	tableName: 'accounts',
	timestamps: true,
});

Account.belongsTo(AccountType, { foreignKey: 'account_type_id' });

export default Account;
