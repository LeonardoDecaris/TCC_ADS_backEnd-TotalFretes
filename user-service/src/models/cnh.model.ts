import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class CnhType extends Model {
    id: number | undefined;
    name: string | undefined;
    description: string | undefined;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
    userUpdateAt: Date | undefined;
}

CnhType.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    userUpdateAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    sequelize,
    tableName: 'cnh_types',
    timestamps: true,
});

export default CnhType;