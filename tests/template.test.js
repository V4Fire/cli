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

	describe('Make test', () => {
		describe('for component', () => {
			it('should provide name of component', async () => {
				const app = getApplication({
					path: 'src/base/b-slider',
					command: 'make-test',
					runners: []
				});

				await app.run();

				const testFileText = app.vfs.readFile(
					'./src/base/b-slider/test/index.js'
				);

				expect(testFileText).contains('b-slider');
				expect(testFileText).contains('bSlider');
				expect(testFileText).not.contains('bDummy');
				expect(testFileText).not.contains('b-dummy');
				expect(testFileText).not.contains('bName');
				expect(testFileText).not.contains('b-name');
			});

			it('should provide name of component in runner', async () => {
				const app = getApplication({
					path: 'src/base/b-slider',
					command: 'make-test',
					runners: ['events']
				});

				await app.run();

				const runnerFileText = app.vfs.readFile(
					'./src/base/b-slider/test/runners/events.js'
				);

				expect(runnerFileText).contains('b-slider');
				expect(runnerFileText).contains('bSlider');
				expect(runnerFileText).contains('events');
				expect(runnerFileText).not.contains('runner');
				expect(runnerFileText).not.contains('bDummy');
				expect(runnerFileText).not.contains('b-dummy');
				expect(runnerFileText).not.contains('bName');
				expect(runnerFileText).not.contains('b-name');
			});
		});

		describe('for module', () => {
			it('should provide name of module', async () => {
				const app = getApplication({
					path: 'src/base/some-module',
					command: 'make-test',
					runners: []
				});

				await app.run();

				const testFileText = app.vfs.readFile(
					'./src/base/some-module/test/index.js'
				);

				expect(testFileText).contains('some-module');
				expect(testFileText).contains('bDummy');
				expect(testFileText).not.contains('name');
			});

			it('should provide name of module in runner', async () => {
				const app = getApplication({
					path: 'src/base/some-module',
					command: 'make-test',
					runners: ['events']
				});

				await app.run();

				const runnerFileText = app.vfs.readFile(
					'./src/base/some-module/test/runners/events.js'
				);

				expect(runnerFileText).contains('some-module');
				expect(runnerFileText).contains('bDummy');
				expect(runnerFileText).contains('b-dummy');
				expect(runnerFileText).not.contains('runner');
				expect(runnerFileText).not.contains('name');
			});
		});
	});
});
