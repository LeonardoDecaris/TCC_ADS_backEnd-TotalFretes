import {
	DEMO_DRIVERS,
	DEFAULT_DEMO_DRIVER_PASSWORD,
	demoDriverEmail,
	isDemoDriverEmail,
	isDemoSeedEnabled,
} from '@total-fretes/demo-seed-data';

import User from '../models/user.model';
import Vehicle from '../models/vehicle.model';
import VehicleType from '../models/vehicleType.model';
import GroupVehicleType from '../models/groupVehicleType.model';
import { createAccountHttp, getAccountTypeIdByName } from '../services/service';
import { logger } from '../config/logging';

async function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createAccountWithRetry(
	data: Parameters<typeof createAccountHttp>[0],
	maxAttempts = 5,
): Promise<boolean> {
	for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
		const ok = await createAccountHttp(data);
		if (ok) return true;
		if (attempt < maxAttempts) {
			logger.warn(`Demo driver seed: account attempt ${attempt} failed, retrying...`);
			await sleep(2000 * attempt);
		}
	}
	return false;
}

async function resolveVehicleTypeId(groupName: string, typeName: string): Promise<number | null> {
	const group = await GroupVehicleType.findOne({ where: { nome: groupName } });
	if (!group?.id) return null;

	const vehicleType = await VehicleType.findOne({
		where: { nome: typeName, groupVehicleType_id: group.id },
	});
	return vehicleType?.id ?? null;
}

export async function seedDemoDrivers(): Promise<{ created: number; existing: number }> {
	if (!isDemoSeedEnabled()) {
		logger.info('Demo drivers seed skipped (DEMO_DATA_SEED_ENABLED=false)');
		return { created: 0, existing: 0 };
	}

	const password = process.env.DEMO_SEED_DRIVER_PASSWORD?.trim() || DEFAULT_DEMO_DRIVER_PASSWORD;
	const userAccountTypeId = await getAccountTypeIdByName('USER');

	if (!userAccountTypeId) {
		logger.warn('Demo drivers seed skipped: USER account type not found');
		return { created: 0, existing: 0 };
	}

	let created = 0;
	let existing = 0;

	for (const spec of DEMO_DRIVERS) {
		const email = demoDriverEmail(spec.index).toLowerCase();
		let user = await User.findOne({ where: { email } });

		if (!user) {
			const vehicleTypeId = await resolveVehicleTypeId(spec.groupVehicleTypeName, spec.vehicleTypeName);
			if (!vehicleTypeId) {
				logger.warn(`Demo driver seed skipped vehicle type for ${email}`);
				continue;
			}

			const vehicle = await Vehicle.create({
				plateNumber: spec.plateNumber,
				chassisNumber: `CHS${spec.index}${spec.plateNumber}`,
				model: spec.vehicleTypeName,
				mark: 'Demo',
				city: 'São Paulo',
				stateUF: 'SP',
				country: 'Brasil',
				vehicleType_id: vehicleTypeId,
			});

			if (!vehicle.id) {
				await vehicle.destroy();
				logger.error(`Demo driver seed failed: vehicle for ${email}`);
				continue;
			}

			user = await User.create({
				name: spec.name,
				email,
				birthDate: spec.birthDate,
				phoneNumber: spec.phoneNumber,
				cpf: spec.cpf,
				sex: spec.sex,
				useGlasses: false,
				isDeficient: false,
				cnhNumber: spec.cnhNumber,
				cnhType_id: spec.cnhType_id,
				issuingAgencyCnh: 'DETRAN/SP',
				vehicle_id: vehicle.id,
			});

			if (!user.id) {
				await user.destroy();
				await vehicle.destroy();
				logger.error(`Demo driver seed failed: user ${email}`);
				continue;
			}

			const accountCreated = await createAccountWithRetry({
				email,
				password,
				subject_id: user.id,
				account_type_id: userAccountTypeId,
			});

			if (!accountCreated) {
				await user.destroy();
				await vehicle.destroy();
				logger.error(`Demo driver seed failed: account for ${email}`);
				continue;
			}

			created += 1;
		} else {
			existing += 1;
		}
	}

	logger.info(`Demo drivers seed completed (created=${created}, existing=${existing})`);
	return { created, existing };
}

export async function listDemoDriversForSeed(): Promise<Array<{ id: number; email: string; index: number }>> {
	const users = await User.findAll({ attributes: ['id', 'email'] });
	return users
		.filter((user) => user.email && isDemoDriverEmail(user.email))
		.map((user) => {
			const email = user.email!.toLowerCase();
			const indexPart = email.replace('demo.motorista.', '').replace('@seed.totalfretes.demo', '');
			return { id: user.id!, email, index: Number(indexPart) };
		})
		.filter((row) => !Number.isNaN(row.index));
}
