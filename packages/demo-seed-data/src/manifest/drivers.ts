import fs from 'fs';
import path from 'path';

export type DemoDriverSpec = {
	index: number;
	name: string;
	cpf: string;
	cnhNumber: string;
	cnhType_id: number;
	phoneNumber: string;
	sex: string;
	birthDate: string;
	vehicleTypeName: string;
	groupVehicleTypeName: string;
	plateNumber: string;
};

const driversFilePath = path.resolve(__dirname, 'data', 'drivers.json');

const parseDrivers = (): DemoDriverSpec[] => {
	const raw = fs.readFileSync(driversFilePath, 'utf8');
	return JSON.parse(raw) as DemoDriverSpec[];
};

export const DEMO_DRIVERS: DemoDriverSpec[] = parseDrivers();
