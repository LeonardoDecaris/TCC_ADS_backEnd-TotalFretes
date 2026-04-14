import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export class CargoType extends Model {
    id: number | undefined;
    name: string | undefined;
    weight: number | undefined;
    vehicleType: string | undefined;
    imageCargo_id: number | undefined;
}

CargoType.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    weight: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    vehicleType: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    imageCargo_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    sequelize,
    tableName: 'cargo_types',
    timestamps: true,
});

export default CargoType;