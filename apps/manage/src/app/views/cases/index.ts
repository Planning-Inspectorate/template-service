import type { ManageService } from '#service';
import { asyncHandler } from '@planning-inspectorate/core/util';
import {
	buildGetJourney,
	buildGetJourneyResponseFromSession,
	buildList,
	buildSave,
	question,
	saveDataToSession,
	validate,
	validationErrorHandler
} from '@planning-inspectorate/dynamic-forms';
import { type IRouter, Router as createRouter } from 'express';
import { createJourney, JOURNEY_ID } from './journey.ts';
import { questions } from './questions.ts';
import { buildSaveController } from './save.ts';
import { createRoutes as createDetailsRoutes } from './view/index.ts';

export function createRoutes(service: ManageService): IRouter {
	const router = createRouter({ mergeParams: true });

	// read answers from the session
	const getJourneyResponse = buildGetJourneyResponseFromSession(JOURNEY_ID);
	const getJourney = buildGetJourney((req, journeyResponse) => createJourney(req, journeyResponse, questions));
	const saveToSession = asyncHandler(buildSave(saveDataToSession));
	const saveToDatabase = asyncHandler(buildSaveController(service));

	router.use('/view/:id', createDetailsRoutes(service));

	router.get('/:section/:question', getJourneyResponse, getJourney, question);
	router.post('/:section/:question', getJourneyResponse, getJourney, validate, validationErrorHandler, saveToSession);

	router.get('/check-your-answers', getJourneyResponse, getJourney, buildList());
	router.post('/check-your-answers', getJourneyResponse, getJourney, saveToDatabase);

	return router;
}
