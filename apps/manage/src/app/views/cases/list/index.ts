import type { ManageService } from '#service';
import { asyncHandler } from '@planning-inspectorate/core/util';
import { type IRouter, Router as createRouter } from 'express';
import { buildListCases } from './list.ts';

export function createRoutes(service: ManageService): IRouter {
	const router = createRouter({ mergeParams: true });

	router.get('/', asyncHandler(buildListCases(service)));

	return router;
}
