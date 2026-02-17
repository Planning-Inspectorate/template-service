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
	}
};

export const questions = createQuestions(questionProps, questionClasses, {}, {});
