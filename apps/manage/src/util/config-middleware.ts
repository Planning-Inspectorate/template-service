import type { Handler } from 'express';

/**
 * Add configuration values to locals.
 */
export function addLocalsConfiguration(): Handler {
	return (req, res, next) => {
		res.locals.config = {
			styleFile: 'style-c5960f31.css',
			headerTitle: 'Manage template'
		};
		next();
	};
}
