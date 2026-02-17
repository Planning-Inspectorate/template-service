import type { JourneyResponse } from '@planning-inspectorate/dynamic-forms';
import { Journey, Section, whenQuestionHasAnswer } from '@planning-inspectorate/dynamic-forms';
import type { Request } from 'express';

export const JOURNEY_ID = 'case-view';

export function createJourney(req: Request, response: JourneyResponse, questions: Record<string, any>) {
	return new Journey({
		journeyId: JOURNEY_ID,
		sections: [
			new Section('Case details', 'questions')
				.addQuestion(questions.reference)
				.addQuestion(questions.howManyApplicants)
				.addQuestion(questions.submissionDate)
				.withCondition(whenQuestionHasAnswer(questions.howManyApplicants, '5'))
				.addQuestion(questions.description)
		],
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
