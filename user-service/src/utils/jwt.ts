import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
	throw new Error('JWT_SECRET não foi configurado');
}

export const verifyToken = (token: string): any => {
	return jwt.verify(token, JWT_SECRET);
};
