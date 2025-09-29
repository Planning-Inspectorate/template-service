import { newDatabaseClient } from '../index.ts';
import { seedStaticData } from './data-static.ts';
import { loadConfig } from '../configuration/config.ts';

async function run() {
	const config = loadConfig();
	const prismaConfig = {
		datasourceUrl: config.db
	};

	const dbClient = newDatabaseClient(prismaConfig);

	try {
		await seedStaticData(dbClient);
	} catch (error) {
		console.error(error);
		throw error;
	} finally {
		await dbClient.$disconnect();
	}
}

run();
