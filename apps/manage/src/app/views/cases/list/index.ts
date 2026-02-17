import type { ManageService } from '#service';
import { type IRouter, Router as createRouter } from 'express';
import { asyncHandler } from '@pins/service-name-lib/util/async-handler.ts';
import { buildListCases } from './list.ts';

export function createRoutes(service: ManageService): IRouter {
	const router = createRouter({ mergeParams: true });

	router.get('/', asyncHandler(buildListCases(service)));

	return router;
}
