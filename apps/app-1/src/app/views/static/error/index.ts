import { Router as createRouter } from 'express';
import { firewallErrorPage } from './controller.ts';

/**
 * @param {import('#service').App1Service} service
 * @returns {import('express').Router}
 */
export function createErrorRoutes(service) {
	const router = createRouter({ mergeParams: true });

	const firewallError = firewallErrorPage(service);

	router.get('/firewall-error', firewallError);

	return router;
}
