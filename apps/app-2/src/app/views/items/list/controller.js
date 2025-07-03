/**
 * @param {import('#service').App2Service} service
 * @returns {import('express').Handler}
 */
export function buildListItems(service) {
	const { db, logger } = service;
	return async (req, res) => {
		logger.info('list items');

		// check the DB connection is working
		await db.$queryRaw`SELECT 1`;

		return res.render('views/items/list/view.njk', {
			pageHeading: 'Some Service Name',
			items: [
				{ task: 'Create new service', done: true },
				{ task: 'Implement a new feature', done: false },
				{ task: 'Fix a bug', done: false }
			]
		});
	};
}
