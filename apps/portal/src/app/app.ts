import type { PortalService } from '#service';
import { addLocalsConfiguration } from '#util/config-middleware.ts';
import { createBaseApp } from '@pins/service-name-lib/app/app.ts';
import type { Express } from 'express';
import { configureNunjucks } from './nunjucks.ts';
import { buildRouter } from './router.ts';

/**
 * @param service
 */
export function createApp(service: PortalService): Express {
	const router = buildRouter(service);
	// create an express app, and configure it for our usage
	return createBaseApp({ service, configureNunjucks, router, middlewares: [addLocalsConfiguration()] });
}
