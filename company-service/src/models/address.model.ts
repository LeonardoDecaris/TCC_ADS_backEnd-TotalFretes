import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class CompanyAddress extends Model {
    id?: number;
    cep?: string;
    street?: string;
    district?: string;
    number?: string;
    city?: string;
    state?: string;
}

CompanyAddress.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    cep: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    street: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    district: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    number: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    state: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    sequelize,
    tableName: 'company_addresses',
    timestamps: true,
});

export default CompanyAddress;