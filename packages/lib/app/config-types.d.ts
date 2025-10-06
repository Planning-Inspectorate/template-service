import { Prisma } from '@pins/service-name-database/src/client';

interface BaseConfig {
	cacheControl: {
		maxAge: string;
	};
	database: Prisma.PrismaClientOptions;
	gitSha?: string;
	httpPort: number;
	logLevel: string;
	NODE_ENV: string;
	srcDir: string;
	session: {
		redisPrefix: string;
		redis?: string;
		secret: string;
	};
	staticDir: string;
}
