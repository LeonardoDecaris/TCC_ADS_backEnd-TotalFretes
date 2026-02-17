import bcrypt from "bcrypt";
import { JwtRole } from "../utils/jwt";
import sequelize from '../config/database';
import { Model, DataTypes } from 'sequelize';

class User extends Model {
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

User.init({
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
	tableName: 'users',
	timestamps: false,
});

User.beforeCreate(async (user: User) => {
	if(user.password) {
		await user.hashPassword();
	}
});

User.beforeUpdate(async (user: User) => {
	if (user.changed("password")) {
		await user.hashPassword();
	}
});

export default User;