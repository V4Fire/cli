const {expect} = require('chai');
const {getApplication, getVFS} = require('./staff/helpers');

describe('Change template option', () => {
	const
		commonVfs = getVFS();

	describe('`make`', () => {
		const
			componentName = 'b-test',
			componentDir = commonVfs.resolve('src', 'components', componentName);

		after(() => {
			if (commonVfs.exists(componentDir)) {
				commonVfs.rmDir(componentDir);
			}
		});

		describe('`mono`', () => {
			it('should create `mono` component', async () => {
				const app = getApplication({
					command: 'make',
					subject: 'block',
					name: componentName,
					template: 'mono'
				});

				await app.run();

				expect(app.vfs.exists(`${componentDir}/${componentName}.ss`)).is.true;
				expect(app.vfs.exists(`${componentDir}/${componentName}.styl`)).is.true;
				expect(app.vfs.exists(`${componentDir}/${componentName}.ts`)).is.false;
				expect(app.vfs.readFile(`${componentDir}/${componentName}.ss`)).contains(
					'- @@ignore'
				);
			});
		});

		describe('`functional`', () => {
			it('should create `functional` component', async () => {
				const app = getApplication({
					command: 'make',
					subject: 'block',
					name: componentName,
					template: 'functional'
				});

				await app.run();

				expect(app.vfs.exists(`${componentDir}/${componentName}.ss`)).is.true;
				expect(app.vfs.exists(`${componentDir}/${componentName}.styl`)).is.true;
				expect(app.vfs.exists(`${componentDir}/${componentName}.ts`)).is.true;
				expect(app.vfs.readFile(`${componentDir}/${componentName}.ts`)).contains(
					'@component({functional: true})'
				);
			});
		});
	});

	describe('`make-test`', () => {
		const
			componentDir = 'src/components/b-test',
			pageDir = 'src/pages/p-test';

		let
			testFileText;

		after(() => {
			if (commonVfs.exists(componentDir)) {
				commonVfs.rmDir(componentDir);
			}

			if (commonVfs.exists(pageDir)) {
				commonVfs.rmDir(pageDir);
			}
		});

		describe('`block`', () => {
			beforeEach(async () => {
				const app = getApplication({
					command: 'make-test',
					subject: 'block',
					target: componentDir
				});

				await app.run();
				testFileText = app.vfs.readFile(`${componentDir}/test/unit/main.ts`);
			});

			it('should provide name of component', () => {
				expect(testFileText).contains('b-test');
				expect(testFileText).contains('Test');
			});

			it('should`t contain any replacers', () => {
				expect(testFileText).not.contains('b-name');
				expect(testFileText).not.contains('bName');
				expect(testFileText).not.contains('BName');
				expect(testFileText).not.contains('r-name');
				expect(testFileText).not.contains('rName');
				expect(testFileText).not.contains('RName');
			});
		});

		describe('`page`', () => {
			beforeEach(async () => {
				const app = getApplication({
					command: 'make-test',
					subject: 'page',
					target: pageDir
				});

				await app.run();

				testFileText = app.vfs.readFile(`${pageDir}/test/project/main.ts`);
			});

			it('should provide name of page', () => {
				expect(testFileText).contains('p-test');
				expect(testFileText).contains('Test');
			});

			it('should`t contain any replacers', () => {
				expect(testFileText).not.contains('p-name');
				expect(testFileText).not.contains('pName');
				expect(testFileText).not.contains('PName');
				expect(testFileText).not.contains('r-name');
				expect(testFileText).not.contains('rName');
				expect(testFileText).not.contains('RName');
			});
		});
	});
});
