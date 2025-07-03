import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
	{
		...js.configs.recommended,
		ignores: ['packages/database/src/client/**', '**/.static/**']
	},
	{
		ignores: ['dist/**', 'node_modules/**', '**/*.min*.js', '**/static/scripts/app.js'],
		languageOptions: {
			ecmaVersion: 2025,
			sourceType: 'module',
			globals: {
				...globals.node
			}
		}
	},
	eslintConfigPrettier
];
