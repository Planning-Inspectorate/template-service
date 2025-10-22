import { Router as createRouter } from 'express';
import { firewallErrorPage } from './controller.ts';
import type { PortalService } from '#service';
import type { IRouter } from 'express';

export function createErrorRoutes(service: PortalService): IRouter {
	const router = createRouter({ mergeParams: true });

	const firewallError = firewallErrorPage(service);

	router.get('/firewall-error', firewallError);

	return router;
}
