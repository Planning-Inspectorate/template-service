import type { ManageService } from '#service';
import type { CaseGetPayload } from '@pins/service-name-database/src/client/models/Case.ts';
import { JourneyResponse } from '@planning-inspectorate/dynamic-forms';
import type { RequestHandler } from 'express';
import { EVENT_TYPES } from '../events.ts';
import type { CreateCaseAnswers } from '../save.ts';
import { JOURNEY_ID } from './journey.ts';

export type Case = CaseGetPayload<{
	include: {
		PublicEvents: true;
		InternalEvents: true;
	};
}>;

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

		const caseDetails = await service.db.case.findUnique({
			where: { id: Number(id) },
			include: {
				PublicEvents: true,
				InternalEvents: true
			}
		});
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
	const events: CreateCaseAnswers['events'] = [];
	if (caseDetails.PublicEvents) {
		events.push(
			...caseDetails.PublicEvents.map((e) => {
				return {
					id: EVENT_TYPES.PUBLIC + '-' + e.id.toString(),
					eventType: EVENT_TYPES.PUBLIC,
					eventDescription: e.description
				};
			})
		);
	}
	if (caseDetails.InternalEvents) {
		events.push(
			...caseDetails.InternalEvents.map((e) => {
				return {
					id: EVENT_TYPES.INTERNAL + '-' + e.id.toString(),
					eventType: EVENT_TYPES.INTERNAL,
					eventDescription: e.description
				};
			})
		);
	}
	return {
		reference: caseDetails.reference,
		description: caseDetails.description,
		applicantCount: String(caseDetails.applicantCount),
		submissionDate: caseDetails.submissionDate?.toISOString(),
		events
	};
}
