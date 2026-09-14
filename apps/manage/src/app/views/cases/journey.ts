import {
	Journey,
	type JourneyResponse,
	ManageListSection,
	Section,
	whenQuestionHasAnswer
} from '@planning-inspectorate/dynamic-forms';
import type { Request } from 'express';
import type { AllQuestions } from './questions.ts';

export const JOURNEY_ID = 'create-a-case';

export function buildSections(questions: AllQuestions) {
	return [
		new Section('Case details', 'questions')
			.addQuestion(questions.reference)
			.addQuestion(questions.selectOne)
			.addQuestion(questions.howManyApplicants)
			.addQuestion(questions.submissionDate)
			.withCondition(whenQuestionHasAnswer(questions.howManyApplicants, '5'))
			.addQuestion(questions.description)
			.addQuestion(
				questions.events,
				new ManageListSection().addQuestion(questions.eventType).addQuestion(questions.eventDescription)
			)
	];
}

export function createJourney(req: Request, response: JourneyResponse, questions: AllQuestions) {
	return new Journey({
		journeyId: JOURNEY_ID,
		sections: buildSections(questions),
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
