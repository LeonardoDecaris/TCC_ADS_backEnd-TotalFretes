import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export class FreightStatusType extends Model {
	id: number | undefined;
    name: string | undefined;
}

FreightStatusType.init({
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
}, {
	sequelize,
	tableName: 'freight_status_types',
	timestamps: true,
});

export default FreightStatusType;