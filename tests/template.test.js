const {expect} = require('chai');
const {getApplication} = require('./staff/helpers');

describe('Change template option', () => {
	describe('Make', () => {
		describe('mono', () => {
			it('should create mono component', async () => {
				const app = getApplication({
					command: 'make',
					subject: 'block',
					name: 'test',
					template: 'mono'
				});

				await app.run();

				expect(app.vfs.exists('./src/components/b-test/b-test.ss')).is.true;
				expect(app.vfs.exists('./src/components/b-test/b-test.styl')).is.true;
				expect(app.vfs.exists('./src/components/b-test/b-test.ts')).is.false;
				expect(app.vfs.readFile('./src/components/b-test/b-test.ss')).contains(
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

				expect(app.vfs.exists('./src/components/b-test/b-test.ss')).is.true;
				expect(app.vfs.exists('./src/components/b-test/b-test.styl')).is.true;
				expect(app.vfs.exists('./src/components/b-test/b-test.ts')).is.true;
				expect(app.vfs.readFile('./src/components/b-test/b-test.ts')).contains(
					'@component({functional: true})'
				);
			});
		});
	});

	describe('`make-test`', () => {
		describe('`block`', () => {
			it('should provide name of component', async () => {
				const app = getApplication({
					command: 'make-test',
					subject: 'block',
					target: 'src/components/b-test'
				});

				await app.run();

				const testFileText = app.vfs.readFile(
					'./src/components/b-test/test/unit/main.ts'
				);

				expect(testFileText).contains('b-test');
				expect(testFileText).contains('bTest');
				expect(testFileText).not.contains('bName');
				expect(testFileText).not.contains('b-name');
			});

			it('should make test for block by name', async () => {
				const app = getApplication({
					command: 'make',
					subject: 'block',
					name: 'b-foo'
				});

				const testApp = getApplication({
					command: 'make-test',
					subject: 'block',
					target: 'b-foo'
				});

				await app.run();
				await testApp.run();

				const testFileText = app.vfs.readFile(
					'./src/components/b-foo/test/unit/main.ts'
				);

				expect(testFileText).contains('b-foo');
				expect(testFileText).contains('bFoo');
				expect(testFileText).not.contains('bName');
				expect(testFileText).not.contains('b-name');
			});
		});

		describe('`page`', () => {
			it('should provide name of page', async () => {
				const app = getApplication({
					command: 'make-test',
					subject: 'page',
					target: 'src/pages/p-foo'
				});

				await app.run();

				const testFileText = app.vfs.readFile(
					'./src/pages/p-foo/test/project/main.ts'
				);

				expect(testFileText).contains('p-foo');
				expect(testFileText).contains('Foo');
				expect(testFileText).not.contains('p-name');
				expect(testFileText).not.contains('RName');
			});

			it('should make test for block by name', async () => {
				const app = getApplication({
					command: 'make',
					subject: 'page',
					name: 'p-foo'
				});

				const testApp = getApplication({
					command: 'make-test',
					subject: 'page',
					target: 'p-foo'
				});

				await app.run();
				await testApp.run();

				const testFileText = app.vfs.readFile(
					'./src/pages/p-foo/test/project/main.ts'
				);

				expect(testFileText).contains('b-foo');
				expect(testFileText).contains('bFoo');
				expect(testFileText).not.contains('bName');
				expect(testFileText).not.contains('b-name');
			});
		});
	});
});
