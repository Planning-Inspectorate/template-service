import type { ManageService } from '#service';
import { type IRouter, Router as createRouter } from 'express';
import {
	buildGetJourney,
	buildList,
	buildSave,
	question,
	validate,
	validationErrorHandler
} from '@planning-inspectorate/dynamic-forms';
import { questions } from '../questions.ts';
import { createJourney } from './journey.ts';
import { buildGetJourneyMiddleware } from './controller.ts';
import { buildSaveFn } from './edit.ts';
import { asyncHandler } from '@pins/service-name-lib/util/async-handler.ts';

export function createRoutes(service: ManageService): IRouter {
	const router = createRouter({ mergeParams: true });
	// read 'answers'/data from the database
	const getJourneyResponse = buildGetJourneyMiddleware(service);
	const getJourney = buildGetJourney((req, journeyResponse) => createJourney(req, journeyResponse, questions));

	router.get('/', getJourneyResponse, getJourney, asyncHandler(buildList()));

	// when any question is answered, return to the 'task list' or case details view
	router.get('/:section/:question', getJourneyResponse, getJourney, question);
	router.post(
		'/:section/:question',
		getJourneyResponse,
		getJourney,
		validate,
		validationErrorHandler,
		buildSave(buildSaveFn(service), true)
	);

	return router;
}
