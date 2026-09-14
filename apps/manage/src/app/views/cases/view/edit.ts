import type { ManageService } from '#service';
import type { CaseUpdateInput } from '@pins/service-name-database/src/client/models/Case.ts';
import type { SaveDataFn } from '@planning-inspectorate/dynamic-forms';
import { EVENT_TYPES } from '../events.ts';
import type { CreateCaseAnswers } from '../save.ts';

/**
 * Save question answers/changes to the database
 * @param service
 */
export function buildSaveFn(service: ManageService): SaveDataFn {
	return async ({ data, req, isManageListItem, manageListQuestionFieldName, manageListItemRemove }) => {
		service.logger.info({ answers: data.answers }, 'save edit');
		const db = service.db;
		const caseId = Number(req.params.id);

		if (isManageListItem) {
			service.logger.info({ data, isManageListItem, manageListQuestionFieldName }, 'manage edit');
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
					await db.publicEvent.delete({
						where: { id: Number(itemId) }
					});
				} else {
					await db.publicEvent.update({
						where: { id: Number(itemId) },
						data: mapEventToData(data.answers)
					});
				}
			} else if (itemType === EVENT_TYPES.INTERNAL) {
				if (manageListItemRemove) {
					await db.internalEvent.delete({
						where: { id: Number(itemId) }
					});
				} else {
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

export function mapEventToData(answers: CreateCaseAnswers['events'][number]) {
	return {
		description: answers.eventDescription
	};
}
