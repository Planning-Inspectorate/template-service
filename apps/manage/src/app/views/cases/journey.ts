import {
	capitalize,
	Journey,
	type JourneyResponse,
	ManageListSection,
	Section,
	whenQuestionHasAnswer
} from '@planning-inspectorate/dynamic-forms';
import type { Request } from 'express';
import { EVENT_TYPES } from './events.ts';
import { type AllQuestions, internalEventQuestions, publicEventQuestions } from './questions.ts';
import type { EventAnswers } from './save.ts';

export const JOURNEY_ID = 'create-a-case';

export function buildSections(questions: AllQuestions, response?: JourneyResponse) {
	const sections = [
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

	// dynamic sections for each event - only if response is provided (edit journey)
	const events = response?.answers.events as Required<EventAnswers>[];
	if (events) {
		for (const event of events) {
			const section = new Section(capitalize(event.eventType) + ' ' + event.id.split('-')[1], event.id);
			sections.push(section);
			if (event.eventType === EVENT_TYPES.PUBLIC) {
				const q = publicEventQuestions(event.id);
				section.addQuestion(q.description).addQuestion(q.date).addQuestion(q.publicised);
			} else if (event.eventType === EVENT_TYPES.INTERNAL) {
				const q = internalEventQuestions(event.id);
				section.addQuestion(q.description).addQuestion(q.eventOwner).addQuestion(q.eventReason);
			}
		}
	}
	return sections;
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
