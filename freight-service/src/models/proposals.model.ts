import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Freight from './freight.model';
import ProposalStatusType from './proposalsStatusTypes.model';

export class Proposal extends Model {
    id: number | undefined;
    freight_id: number | undefined;
    driver_id: number | undefined;
    status_id: number | undefined;
    value: number | undefined;
    rejection_comment: string | null | undefined;
}

Proposal.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    freight_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    driver_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    value: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    rejection_comment: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
}, {
    sequelize,
    tableName: 'proposals',
    timestamps: true,
});

Proposal.belongsTo(Freight, { foreignKey: 'freight_id' });
Proposal.belongsTo(ProposalStatusType, { foreignKey: 'status_id' });

export default Proposal;