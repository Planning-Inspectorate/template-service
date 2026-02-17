import type { ManageService } from '#service';
import type { SaveDataFn } from '@planning-inspectorate/dynamic-forms';
import type { CreateCaseAnswers } from '../save.ts';
import type { CaseUpdateInput } from '@pins/service-name-database/src/client/models/Case.ts';

/**
 * Save question answers/changes to the database
 * @param service
 */
export function buildSaveFn(service: ManageService): SaveDataFn {
	return async ({ data, req }) => {
		service.logger.info({ answers: data.answers }, 'save edit');

		await service.db.case.update({
			where: { id: Number(req.params.id) },
			data: mapToDatabase(data.answers)
		});

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
