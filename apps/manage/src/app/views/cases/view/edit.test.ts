import assert from 'node:assert';
import { describe, it } from 'node:test';
import { mapEdits } from './edit.ts';

describe('edit', () => {
	describe('mapEdits', () => {
		it('should leave normal fields', () => {
			const answers = {
				reference: 'REF/001'
			};
			const mapped = mapEdits(answers);
			assert.strictEqual(mapped, answers);
		});
		it('should map event fields', () => {
			const answers = {
				reference: 'REF/001',
				'public-1EventDescription': 'description'
			};
			const mapped = mapEdits(answers);
			assert.ok(mapped.eventEdits);
			assert.ok(mapped.eventEdits.length === 1);
			assert.deepStrictEqual(mapped.eventEdits[0], {
				id: '1',
				type: 'public',
				EventDescription: 'description'
			});
		});
		it('should map multiple event fields', () => {
			const answers = {
				reference: 'REF/001',
				'public-1EventDescription': 'description',
				'public-1EventDate': '2026'
			};
			const mapped = mapEdits(answers);
			assert.ok(mapped.eventEdits);
			assert.ok(mapped.eventEdits.length === 2);
			assert.deepStrictEqual(mapped.eventEdits[1], {
				id: '1',
				type: 'public',
				EventDate: '2026'
			});
		});
	});
});
