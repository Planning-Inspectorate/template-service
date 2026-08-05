import type { QuestionProps } from '@planning-inspectorate/dynamic-forms/src/questions/question-props.d.ts';
import {
	COMPONENT_TYPES,
	createQuestions,
	questionClasses,
	RequiredValidator
} from '@planning-inspectorate/dynamic-forms';

const questionProps: Record<string, QuestionProps> = {
	reference: {
		type: COMPONENT_TYPES.SINGLE_LINE_INPUT,
		question: 'What is the reference for this case?',
		title: 'Reference',
		fieldName: 'reference',
		url: 'case-reference',
		validators: [new RequiredValidator('Enter the case reference')]
	},
	selectOne: {
		type: COMPONENT_TYPES.RADIO,
		question: 'What do you want?',
		title: 'selectOne',
		fieldName: 'selectOne',
		url: 'select-one',
		options: [
			{ text: 'Option 1', value: 'option-1' },
			{
				text: 'Option 2',
				value: 'option-2',
				conditional: {
					fieldName: 'myField1',
					question: 'Provide more details',
					type: 'text',
					label: 'Details'
				}
			},
			{ text: 'Option 3', value: 'option-3' }
		]
	},
	description: {
		type: COMPONENT_TYPES.TEXT_ENTRY,
		question: 'What is the description of the case?',
		title: 'Description',
		fieldName: 'description',
		url: 'description',
		validators: [new RequiredValidator('Enter the case description')]
	},
	howManyApplicants: {
		type: COMPONENT_TYPES.NUMBER,
		question: 'How many applicants are there?',
		title: 'Applicant Count',
		fieldName: 'applicantCount',
		url: 'applicant-count',
		validators: []
	},
	submissionDate: {
		type: COMPONENT_TYPES.DATE,
		question: 'When was the case submitted?',
		title: 'Submission Date',
		fieldName: 'submissionDate',
		url: 'submission-date',
		validators: []
	}
};

export const questions = createQuestions(questionProps, questionClasses, {}, {});
