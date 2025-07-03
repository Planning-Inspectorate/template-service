import pino from 'pino';

/**
 * @param {{logLevel: string, NODE_ENV: string}} config
 * @returns {import('pino').Logger}
 */
export function initLogger(config) {
	// pino-pretty options: https://github.com/pinojs/pino-pretty?tab=readme-ov-file#options
	const transport = {
		targets: [
			{
				target: 'pino-pretty',
				level: config.logLevel,
				options: {
					ignore: 'pid,hostname',
					colorize: true,
					translateTime: 'HH:MM:ss.l'
				}
			}
		]
	};

	// configure the pino logger for use within the app
	return pino({
		timestamp: pino.stdTimeFunctions.isoTime,
		level: config.logLevel,
		// only pretty print in dev
		transport: config.NODE_ENV === 'production' ? undefined : transport
	});
}
