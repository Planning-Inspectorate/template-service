import type { ManageService } from '#service';
import type { Case } from '@pins/service-name-database/src/client/client.ts';
import type { RequestHandler } from 'express';
import { JOURNEY_ID } from './journey.ts';
import { JourneyResponse } from '@planning-inspectorate/dynamic-forms';
import type { CreateCaseAnswers } from '../save.ts';

/**
 * Get data from the database to populate the journey response
 * @param service
 */
export function buildGetJourneyMiddleware(service: ManageService): RequestHandler {
	return async (req, res, next) => {
		const id = req.params.id;
		if (!id) {
			throw new Error('id param required');
		}
		service.logger.info({ id }, 'view case');

		const caseDetails = await service.db.case.findUnique({ where: { id: Number(id) } });
		if (caseDetails === null) {
			throw new Error('case not found');
		}
		const answers = databaseToViewModel(caseDetails);

		service.logger.info({ answers }, 'view case');

		// put these on locals for the list controller
		res.locals.originalAnswers = { ...answers };
		res.locals.journeyResponse = new JourneyResponse(JOURNEY_ID, 'ref', answers);

		next();
	};
}

function databaseToViewModel(caseDetails: Case): CreateCaseAnswers {
	return {
		reference: caseDetails.reference,
		description: caseDetails.description,
		applicantCount: String(caseDetails.applicantCount),
		submissionDate: caseDetails.submissionDate?.toISOString()
	};
}
