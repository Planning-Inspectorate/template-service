import { PrismaClient } from '@pins/service-name-database/src/client/index.js';
import type { Prisma } from '@pins/service-name-database/src/client/client.d.ts';
import type { Logger } from 'pino';

export function initDatabaseClient(
	config: { database: Prisma.PrismaClientOptions; NODE_ENV: string },
	logger: Logger
): PrismaClient {
	let prismaLogger: Logger | undefined;

	if (config.NODE_ENV !== 'production') {
		prismaLogger = logger;
	}

	return newDatabaseClient(config.database, prismaLogger);
}

export function newDatabaseClient(prismaConfig: Prisma.PrismaClientOptions, logger?: Logger): PrismaClient {
	const prisma = new PrismaClient({
		...prismaConfig,
		log: [
			{
				emit: 'event',
				level: 'query'
			},
			{
				emit: 'event',
				level: 'error'
			},
			{
				emit: 'event',
				level: 'info'
			},
			{
				emit: 'event',
				level: 'warn'
			}
		]
	});

	if (logger) {
		const logQuery = (e: Prisma.QueryEvent) => {
			logger.debug({ query: e.query, params: e.params, duration: e.duration }, 'Prisma query');
		};

		const logError = (e: Prisma.LogEvent) => logger.error({ e }, 'Prisma error');
		const logInfo = (e: Prisma.LogEvent) => logger.debug({ e });
		const logWarn = (e: Prisma.LogEvent) => logger.warn({ e });

		prisma.$on('query', logQuery);
		prisma.$on('error', logError);
		prisma.$on('info', logInfo);
		prisma.$on('warn', logWarn);
	}

	return prisma;
}
