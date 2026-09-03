import { eslintConfig } from '@planning-inspectorate/coding-standards';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
	...eslintConfig,
	// TODO deprecate override when no-explicit-any is enabled in our coding-standards config
	{
		files: ['**/*.ts'],
		extends: [tseslint.configs.recommended],
		rules: {
			'@typescript-eslint/consistent-type-imports': 'error',
			'@typescript-eslint/no-explicit-any': 'error'
		}
	}
]);
