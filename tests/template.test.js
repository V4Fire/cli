const {expect} = require('chai');
const {getApplication} = require('./staff/helpers');

describe('Change template option', () => {
	describe('mono', () => {
		it('should create mono component', async () => {
			const app = getApplication({
				command: 'make',
				subject: 'block',
				name: 'test',
				template: 'mono'
			});

			await app.run();

			expect(app.vfs.exists('./src/base/b-test/b-test.ss')).is.true;
			expect(app.vfs.exists('./src/base/b-test/b-test.styl')).is.true;
			expect(app.vfs.exists('./src/base/b-test/b-test.ts')).is.false;
			expect(app.vfs.readFile('./src/base/b-test/b-test.ss')).contains(
				'- @@ignore'
			);
		});
	});

	describe('functional', () => {
		it('should create functional component', async () => {
			const app = getApplication({
				command: 'make',
				subject: 'block',
				name: 'test',
				template: 'functional'
			});

			await app.run();

			expect(app.vfs.exists('./src/base/b-test/b-test.ss')).is.true;
			expect(app.vfs.exists('./src/base/b-test/b-test.styl')).is.true;
			expect(app.vfs.exists('./src/base/b-test/b-test.ts')).is.true;
			expect(app.vfs.readFile('./src/base/b-test/b-test.ts')).contains(
				'@component({functional: true})'
			);
		});
	});
});
