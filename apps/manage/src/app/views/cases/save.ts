import type { RequestHandler } from 'express';
import type { ManageService } from '#service';
import type { JourneyResponse } from '@planning-inspectorate/dynamic-forms';
import type { CaseCreateInput } from '@pins/service-name-database/src/client/models/Case.ts';

/**
 * The structure of data for the journey answers
 * depends on the fieldName for each question
 */
export interface CreateCaseAnswers {
	reference: string;
	description: string;
	applicantCount: string;
	submissionDate?: string;
}

/**
 * Returns a controller/handler to save the journey answers to the database
 * @param service
 */
export function buildSaveController(service: ManageService): RequestHandler {
	return async (req, res) => {
		if (!res.locals || !res.locals.journeyResponse) {
			throw new Error('journey response required');
		}
		const journeyResponse = res.locals.journeyResponse as JourneyResponse;
		const answers = journeyResponse.answers as CreateCaseAnswers;
		if (typeof answers !== 'object') {
			throw new Error('answers should be an object');
		}

		service.logger.info(answers, 'save');

		await service.db.case.create({
			data: mapToDatabase(answers)
		});

		res.render('views/layouts/success.njk', { reference: answers.reference });
	};
}

export function mapToDatabase(answers: CreateCaseAnswers): CaseCreateInput {
	return {
		reference: answers.reference,
		description: answers.description,
		applicantCount: Number(answers.applicantCount),
		submissionDate: answers.submissionDate
	};
}
