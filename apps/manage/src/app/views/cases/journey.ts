import { Journey, type JourneyResponse, Section } from '@planning-inspectorate/dynamic-forms';
import type { Request } from 'express';

export const JOURNEY_ID = 'create-a-case';

export function createJourney(req: Request, response: JourneyResponse, questions: Record<string, any>) {
	return new Journey({
		journeyId: JOURNEY_ID,
		sections: [new Section('Questions', 'questions').addQuestion(questions.reference)],
		taskListUrl: 'check-your-answers',
		journeyTemplate: 'views/layouts/layout-journey.njk',
		taskListTemplate: 'views/layouts/layout-check-your-answers.njk',
		journeyTitle: 'Create a case',
		returnToListing: false,
		makeBaseUrl: () => req.baseUrl,
		initialBackLink: '/',
		response
	});
}
