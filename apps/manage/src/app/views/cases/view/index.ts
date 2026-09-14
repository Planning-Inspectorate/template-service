import type { ManageService } from '#service';
import { asyncHandler } from '@planning-inspectorate/core/util';
import {
	buildGetJourney,
	buildList,
	buildSave,
	question,
	validate,
	validationErrorHandler
} from '@planning-inspectorate/dynamic-forms';
import { type IRouter, Router as createRouter } from 'express';
import { questions } from '../questions.ts';
import { buildGetJourneyMiddleware } from './controller.ts';
import { buildSaveFn } from './edit.ts';
import { createJourney } from './journey.ts';

export function createRoutes(service: ManageService): IRouter {
	const router = createRouter({ mergeParams: true });
	// read 'answers'/data from the database
	const getJourneyResponse = buildGetJourneyMiddleware(service);
	const getJourney = buildGetJourney((req, journeyResponse) => createJourney(req, journeyResponse, questions));
	const saveFn = buildSaveFn(service);
	const saveEdits = buildSave(saveFn, true);
	const saveListEdits = buildSave(saveFn, false);

	router.use(getJourneyResponse, getJourney);

	router.get('/', asyncHandler(buildList()));

	// when any question is answered, return to the 'task list' or case details view
	router.get('/:section/:question{/:manageListAction/:manageListItemId/:manageListQuestion}', question);

	router.post('/:section/:question', validate, validationErrorHandler, asyncHandler(saveEdits));
	router.post(
		'/:section/:question{/:manageListAction/:manageListItemId/:manageListQuestion}',
		validate,
		validationErrorHandler,
		asyncHandler(saveListEdits)
	);

	return router;
}
