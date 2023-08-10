const {expect} = require('chai');
const {getApplication} = require('./staff/helpers');

describe('Change extend option', () => {
	describe('i-data', () => {
		it('should create component which extends i-data', async () => {
			const app = getApplication({
				command: 'make',
				subject: 'block',
				name: 'test',
				extend: 'i-data'
			});

			await app.run();

			expect(app.vfs.exists('./src/components/b-test/b-test.ss')).is.true;
			expect(app.vfs.readFile('./src/components/b-test/b-test.ts')).contains(
				'i-data/i-data'
			);

			expect(app.vfs.readFile('./src/components/b-test/b-test.ts')).contains(
				'extends iData'
			);
		});
	});

	describe('For page', () => {
		it('should change default parent class', async () => {
			const app = getApplication({
				command: 'make',
				subject: 'page',
				name: 'test'
			});

			await app.run();

			expect(app.vfs.exists('./src/pages/p-test/p-test.ss')).is.true;
			expect(app.vfs.readFile('./src/pages/p-test/p-test.ts')).contains(
				'i-dynamic-page/i-dynamic-page'
			);

			expect(app.vfs.readFile('./src/pages/p-test/p-test.ts')).contains(
				'extends iDynamicPage'
			);
		});
	});
});
