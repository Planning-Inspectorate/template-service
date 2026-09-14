import type { JourneyResponse } from '@planning-inspectorate/dynamic-forms';
import { Journey } from '@planning-inspectorate/dynamic-forms';
import type { Request } from 'express';
import { buildSections } from '../journey.ts';
import type { AllQuestions } from '../questions.ts';

export const JOURNEY_ID = 'case-view';

export function createJourney(req: Request, response: JourneyResponse, questions: AllQuestions) {
	return new Journey({
		journeyId: JOURNEY_ID,
		sections: buildSections(questions),
		taskListUrl: '/',
		journeyTemplate: 'views/layouts/layout-journey.njk',
		taskListTemplate: 'views/layouts/layout-case-details.njk',
		journeyTitle: 'Case view',
		returnToListing: false,
		makeBaseUrl: () => req.baseUrl,
		initialBackLink: '/',
		response
	});
}
