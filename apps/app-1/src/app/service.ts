import { BaseService } from '@pins/service-name-lib/app/base-service.ts';
import type { Config } from './config.ts';

/**
 * This class encapsulates all the services and clients for the application
 */
export class App1Service extends BaseService {
	constructor(config: Config) {
		super(config);
	}
}
