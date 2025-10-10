import type { PrismaClient } from '@pins/service-name-database/src/client/client.ts';

export async function seedStaticData(dbClient: PrismaClient) {
	// TODO: add static seed data
	await dbClient.$queryRaw`SELECT 1`;
	console.log('static data seed complete');
}
