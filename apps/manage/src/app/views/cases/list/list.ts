import type { ManageService } from '#service';
import type { RequestHandler } from 'express';
import type { Case } from '@pins/service-name-database/src/client/client.ts';
import { formatDateForDisplay } from '@planning-inspectorate/dynamic-forms';

export function buildListCases(service: ManageService): RequestHandler {
	return async (req, res) => {
		const cases = await service.db.case.findMany({
			select: {
				id: true,
				reference: true,
				submissionDate: true
			}
		});

		res.render('views/cases/list/list.njk', {
			rows: mapToViewModel(cases)
		});
	};
}

interface TableColumn {
	text?: string;
	html?: string;
}

function mapToViewModel(cases: Partial<Case>[]): TableColumn[][] {
	const rows = [];
	for (const c of cases) {
		const row = [];
		row.push({ text: c.reference });
		row.push({ text: (c.submissionDate && formatDateForDisplay(c.submissionDate)) || 'Not set' });
		row.push({
			html: `<a href="/case/view/${c.id}" class="govuk-link">View</a>`
		});
		rows.push(row);
	}
	return rows;
}
