import bcrypt from "bcrypt";
import { JwtRole } from "../utils/jwt";
import sequelize from '../config/database';
import { Model, DataTypes } from 'sequelize';

class auth extends Model {
	id?: number;
	email?: string;
	password?: string;
	role?: JwtRole;

	public async hashPassword() {
		this.password = await bcrypt.hash(this.password!, 10);
	}

	public async validatePassword(password: string): Promise<boolean> {
		return await bcrypt.compare(password, this.password!);
	}
}

auth.init({
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
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
	role: {
		type: DataTypes.STRING,
		allowNull: false,
		validate: {
			isIn: [['admin', 'empresa', 'usuario']],
		},
	},
}, {
	sequelize,
	tableName: 'auths',
	timestamps: false,
});

auth.beforeCreate(async (auth: auth) => {
	if(auth.password) {
		await auth.hashPassword();
	}
});

auth.beforeUpdate(async (auth: auth) => {
	if (auth.changed("password")) {
		await auth.hashPassword();
	}
});

export default auth;