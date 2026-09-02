import { initDatabaseClient } from '@pins/service-name-database';
import type { PrismaClient } from '@pins/service-name-database/src/client/client.ts';
import { BaseService } from '@planning-inspectorate/core/app';
import type { Config } from './config.ts';

/**
 * This class encapsulates all the services and clients for the application
 */
export class ManageService extends BaseService<PrismaClient> {
	/**
	 * @private
	 */
	#config: Config;

	constructor(config: Config) {
		super(config, initDatabaseClient);
		this.#config = config;
	}

	get authConfig(): Config['auth'] {
		return this.#config.auth;
	}

	get authDisabled(): boolean {
		return this.#config.auth.disabled;
	}
}
