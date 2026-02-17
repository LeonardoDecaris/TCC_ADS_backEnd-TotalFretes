import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class CnhType extends Model {
    id?: number;
    name?: string;
    shortName?: string;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
    userUpdateAt?: Date;
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
    shortName: {
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