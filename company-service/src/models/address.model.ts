// - COMPANY_ADDRESS:
// 	– id
// 	– cep
// – street
// – district
// – number
// – city
// – state
// – created_at
// – updated_at
// – userUpdate_at


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
    createdAt?: Date;
    updatedAt?: Date;
    userUpdateAt?: Date;
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
    tableName: 'company_addresses',
    timestamps: true,
});

export default CompanyAddress;