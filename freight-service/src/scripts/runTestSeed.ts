import dotenv from 'dotenv';

dotenv.config();

const sequelize = require('../config/database').default;
require('../models/associations');
const { runDatabaseSeeds } = require('../config/runDatabaseSeeds');

(async () => {
	try {
		await sequelize.authenticate();
		console.log('Banco conectado.');

		await sequelize.sync({ alter: false });
		console.log('Tabelas sincronizadas.');

		await runDatabaseSeeds();

		console.log('');
		console.log('Seeds concluídos (catálogos + TF-TEST-*).');
		console.log('Tela /Proposals — pendentes: TF-TEST-0141, 0142, 0144, 0145');
		console.log('Tela /Proposals — ver aceitas: TF-TEST-0143');

		process.exitCode = 0;
	} catch (error) {
		console.error('Falha no seed:', error);
		process.exitCode = 1;
	} finally {
		await sequelize.close();
	}
	process.exit();
})();
