import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export class ProposalStatusType extends Model {
	id: number | undefined;
    name: string | undefined;
}

ProposalStatusType.init({
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
	tableName: 'proposals_status_types',
	timestamps: true,
});

export default ProposalStatusType;