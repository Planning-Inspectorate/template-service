import type { ManageService } from '#service';
import type { CaseUpdateInput } from '@pins/service-name-database/src/client/models/Case.ts';
import type { SaveDataFn } from '@planning-inspectorate/dynamic-forms';
import { MANAGE_LIST_ACTIONS } from '@planning-inspectorate/dynamic-forms';
import { EVENT_TYPES } from '../events.ts';
import type { CreateCaseAnswers, EventAnswers } from '../save.ts';

const eventKeyPattern = /^(public|internal)-([0-9]*)([a-zA-Z]*)$/;

export type CaseEdits = Partial<CreateCaseAnswers> & {
	eventEdits?: {
		type: string;
		id: string;
		[key: string]: string | boolean;
	}[];
};

/**
 * Save question answers/changes to the database
 * @param service
 */
export function buildSaveFn(service: ManageService): SaveDataFn {
	return async ({ data, req, isManageListItem, manageListQuestionFieldName, manageListItemRemove }) => {
		service.logger.info({ answers: data.answers }, 'save edit');
		const db = service.db;
		const caseId = Number(req.params.id);

		const edits = mapEdits(data.answers);

		if (edits.eventEdits) {
			for (const edit of edits.eventEdits) {
				if (edit.type === EVENT_TYPES.PUBLIC) {
					service.logger.info(edit, 'updating event');
					await db.publicEvent.update({
						where: { id: Number(edit.id) },
						data: {
							description: edit.EventDescription as string,
							eventDate: edit.EventDate as string,
							publicised: edit.Publicised as boolean
						}
					});
				} else if (edit.type === EVENT_TYPES.INTERNAL) {
					service.logger.info(edit, 'updating event');
					await db.internalEvent.update({
						where: { id: Number(edit.id) },
						data: {
							description: edit.EventDescription as string,
							eventOwner: edit.Owner as string,
							eventReason: edit.Reason as string
						}
					});
				}
			}
		} else if (isManageListItem) {
			service.logger.info({ data, isManageListItem, manageListQuestionFieldName }, 'manage edit');
			if (req.params.manageListAction === MANAGE_LIST_ACTIONS.ADD) {
				// handle this case somehow
				return;
			}
			const rawItemId = req.params.manageListItemId;
			const [itemType, itemId] = rawItemId.split('-');

			if ('eventType' in data.answers) {
				if (data.answers.eventType === itemType) {
					// nothing to do
					return;
				}
				throw new Error('cannot change event type');
			}

			if (itemType === EVENT_TYPES.PUBLIC) {
				if (manageListItemRemove) {
					service.logger.info({ itemId, itemType }, 'removing event');
					await db.publicEvent.delete({
						where: { id: Number(itemId) }
					});
				} else {
					service.logger.info({ itemId, itemType, data: mapEventToData(data.answers) }, 'updating event');
					await db.publicEvent.update({
						where: { id: Number(itemId) },
						data: mapEventToData(data.answers)
					});
				}
			} else if (itemType === EVENT_TYPES.INTERNAL) {
				if (manageListItemRemove) {
					service.logger.info({ itemId, itemType }, 'removing event');
					await db.internalEvent.delete({
						where: { id: Number(itemId) }
					});
				} else {
					service.logger.info({ itemId, itemType, data: mapEventToData(data.answers) }, 'updating event');
					await db.internalEvent.update({
						where: { id: Number(itemId) },
						data: mapEventToData(data.answers)
					});
				}
			}
		} else {
			await service.db.case.update({
				where: { id: caseId },
				data: mapToDatabase(data.answers)
			});
		}

		service.logger.info('case updated');
	};
}

export function mapToDatabase(answers: CreateCaseAnswers): CaseUpdateInput {
	return {
		reference: answers.reference,
		description: answers.description,
		applicantCount: answers.applicantCount ? Number(answers.applicantCount) : undefined,
		submissionDate: answers.submissionDate
	};
}

export function mapEventToData(answers: EventAnswers) {
	return {
		description: answers.eventDescription
	};
}

export function mapEdits(answers: Partial<CreateCaseAnswers>): CaseEdits {
	const eventEdits: CaseEdits['eventEdits'] = [];
	for (const [k, v] of Object.entries(answers)) {
		if (eventKeyPattern.test(k)) {
			const [, type, id, field] = eventKeyPattern.exec(k) || [];
			eventEdits.push({
				id,
				type: type!,
				[field]: v as string
			});
		}
	}
	if (Object.keys(eventEdits).length > 0) {
		return {
			eventEdits,
			...answers
		};
	}
	return answers;
}
