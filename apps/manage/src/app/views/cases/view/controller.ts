import type { ManageService } from '#service';
import type { CaseGetPayload } from '@pins/service-name-database/src/client/models/Case.ts';
import { booleanToYesNoValue, JourneyResponse } from '@planning-inspectorate/dynamic-forms';
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

export type PublicEventId = `${(typeof EVENT_TYPES)['PUBLIC']}-${string}`;
export type InternalEventId = `${(typeof EVENT_TYPES)['INTERNAL']}-${string}`;

export interface PublicEvent {
	[key: `${PublicEventId}EventDescription`]: string | null | undefined;
	[key: `${PublicEventId}EventDate`]: Date | null | undefined;
	[key: `${PublicEventId}Publicised`]: string | null | undefined;
}

export interface InternalEvent {
	[key: `${InternalEventId}EventDescription`]: string | null | undefined;
	[key: `${InternalEventId}Owner`]: string | null | undefined;
	[key: `${InternalEventId}Reason`]: string | null | undefined;
}

export interface CaseViewModel extends CreateCaseAnswers, PublicEvent, InternalEvent {}

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

function databaseToViewModel(caseDetails: Case): CaseViewModel {
	const viewModel: CaseViewModel = {
		reference: caseDetails.reference,
		description: caseDetails.description,
		applicantCount: String(caseDetails.applicantCount),
		submissionDate: caseDetails.submissionDate?.toISOString()
	};
	const events: CreateCaseAnswers['events'] = [];
	if (caseDetails.PublicEvents) {
		for (const e of caseDetails.PublicEvents) {
			const id = (EVENT_TYPES.PUBLIC + '-' + e.id.toString()) as PublicEventId;
			events.push({
				id,
				eventType: EVENT_TYPES.PUBLIC,
				eventDescription: e.description
			});

			viewModel[`${id}EventDescription`] = e.description;
			viewModel[`${id}EventDate`] = e.eventDate;
			viewModel[`${id}Publicised`] = booleanToYesNoValue(e.publicised);
		}
	}
	if (caseDetails.InternalEvents) {
		for (const e of caseDetails.InternalEvents) {
			const id = (EVENT_TYPES.INTERNAL + '-' + e.id.toString()) as InternalEventId;
			events.push({
				id,
				eventType: EVENT_TYPES.INTERNAL,
				eventDescription: e.description
			});

			viewModel[`${id}EventDescription`] = e.description;
			viewModel[`${id}Owner`] = e.eventOwner;
			viewModel[`${id}Reason`] = e.eventReason;
		}
	}
	viewModel.events = events;
	return viewModel;
}
