import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import FreightStatusType from './freightStatusTypes.model';

export class FreightStatusHistory extends Model {
	id?: number;
	freight_id?: number;
	status_id?: number;
	occurred_at?: Date;
}

FreightStatusHistory.init(
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		freight_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		status_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		occurred_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
	},
	{
		sequelize,
		tableName: 'freight_status_history',
		timestamps: false,
	}
);

FreightStatusHistory.belongsTo(FreightStatusType, { foreignKey: 'status_id' });

export default FreightStatusHistory;
