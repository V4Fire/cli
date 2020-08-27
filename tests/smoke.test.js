const {expect} = require('chai');
const {getApplication} = require('./staff/helpers');

describe('Smoke v4fire test', () => {
	describe('Exec make command', () => {
		describe('Block', () => {
			it('should create component folder', async () => {
				const app = getApplication({
					command: 'make',
					subject: 'block',
					name: 'test'
				});

				await app.run();

				expect(app.vfs.exists('./src/base/b-test/b-test.ss')).is.true;
				expect(app.vfs.readFile('./src/base/b-test/CHANGELOG.MD')).contains(
					new Date().toISOString().substr(0, 10)
				);
			});
		});

		describe('Page', () => {
			it('should create page component folder', async () => {
				const app = getApplication({
					command: 'make',
					subject: 'page',
					name: 'test'
				});

				await app.run();

				expect(app.vfs.exists('./src/pages/p-test/p-test.ss')).is.true;
			});
		});
	});
});
