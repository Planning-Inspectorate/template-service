import { BaseService } from '@pins/service-name-lib/app/base-service.ts';
import type { Config } from './config.ts';

/**
 * This class encapsulates all the services and clients for the application
 */
export class App2Service extends BaseService {
	/**
	 * @private
	 */
	#config: Config;

	constructor(config: Config) {
		super(config);
		this.#config = config;
	}

	get authConfig(): Config['auth'] {
		return this.#config.auth;
	}

	get authDisabled(): boolean {
		return this.#config.auth.disabled;
	}
}
