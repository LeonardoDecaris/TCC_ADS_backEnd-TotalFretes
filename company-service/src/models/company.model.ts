import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import CompanyAddress from './address.model';

export type ParsedPaymentToken = {
	companyId: number;
	secret: string;
};

export class Company extends Model {
	id?: number;
	name?: string;
	email?: string;
	birthDate?: Date;
	phoneNumber?: string;
	website?: string;
	cnpj?: string;
	company_image_id?: number;
	companyAddress_id?: number;
	isPaid?: boolean;
	payment_token_hash?: string | null;

	static parsePaymentToken(token: string): ParsedPaymentToken | null {
		const trimmed = token.trim();
		const dotIndex = trimmed.indexOf('.');

		if (dotIndex <= 0) return null;

		const companyId = Number(trimmed.slice(0, dotIndex));
		const secret = trimmed.slice(dotIndex + 1);

		if (!Number.isInteger(companyId) || companyId <= 0 || !secret) {
			return null;
		}

		return { companyId, secret };
	}

	async issuePaymentToken(): Promise<string> {
		if (!this.id) {
			throw new Error('Company id is required to issue a payment token');
		}

		const secret = crypto.randomBytes(32).toString('base64url');
		const hash = await bcrypt.hash(secret, 10);

		this.payment_token_hash = hash;
		await this.save();

		return `${this.id}.${secret}`;
	}

	async verifyPaymentToken(token: string): Promise<boolean> {
		const parsed = Company.parsePaymentToken(token);

		if (!parsed || !this.id || parsed.companyId !== this.id) {
			return false;
		}

		if (!this.payment_token_hash) {
			return false;
		}

		return bcrypt.compare(parsed.secret, this.payment_token_hash);
	}

	async markAsPaid(): Promise<void> {
		this.isPaid = true;
		this.payment_token_hash = null;
		await this.save();
	}
}

Company.init({
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	email: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
	},
	birthFundation: {
		type: DataTypes.DATE,
		allowNull: false,
	},
	phoneNumber: {
		type: DataTypes.STRING,
		allowNull: true,
	},
	website: {
		type: DataTypes.STRING,
		allowNull: true,
	},
	cnpj: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
	},
	company_image_id: {
		type: DataTypes.INTEGER,
		allowNull: true,
	},
	companyAddress_id: {
		type: DataTypes.INTEGER,
		allowNull: true,
	},
	isPaid: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: false,
	},
	payment_token_hash: {
		type: DataTypes.STRING(255),
		allowNull: true,
	},
}, {
	sequelize,
	tableName: 'company',
	timestamps: true,
});

Company.belongsTo(CompanyAddress, { foreignKey: 'companyAddress_id' });

export default Company;
