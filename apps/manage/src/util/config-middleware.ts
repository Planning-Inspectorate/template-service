import type { Handler } from 'express';

/**
 * Add configuration values to locals.
 */
export function addLocalsConfiguration(): Handler {
	return (req, res, next) => {
		res.locals.config = {
			styleFile: 'style-d1b1fc83.css',
			headerTitle: 'Manage template'
		};
		next();
	};
}
