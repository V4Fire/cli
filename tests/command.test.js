const {expect} = require('chai');
const {getApplication} = require('./staff/helpers');

describe('Exec command', () => {
	describe('Make', () => {
		it('should create component', async () => {
			const app = getApplication({
				command: 'make',
				subject: 'block',
				name: 'test'
			});

			await app.run();

			expect(app.vfs.exists('./src/base/b-test/b-test.ss')).is.true;
		});

		describe('App', () => {
			it('should create full application', async () => {
				const app = getApplication({
					command: 'make',
					subject: 'app',
					name: 'test-app',
					noInstall: true
				});

				await app.run();

				expect(
					app.vfs.exists('./test-app/src/base/b-hello-world/b-hello-world.ss')
				).is.true;

				expect(app.vfs.exists('./test-app/src/pages/p-root/p-root.ss')).is.true;
				expect(app.vfs.exists('./test-app/package.json')).is.true;
				expect(app.vfs.exists('./test-app/node_nodules')).is.false;
			});
		});
	});

	describe('Rename', () => {
		it('should rename component', async () => {
			const app = getApplication({
				command: 'make',
				subject: 'block',
				name: 'test'
			});

			await app.run();

			expect(app.vfs.exists('./src/base/b-test/b-test.ss')).is.true;
			expect(app.vfs.exists('./src/base/b-test/CHANGELOG.md')).is.true;
			expect(app.vfs.exists('./src/base/b-test/README.md')).is.true;

			const app2 = getApplication({
				command: 'rename',
				name: 'test',
				newName: 'plot'
			});

			await app2.run();

			expect(app2.vfs.exists('./src/base/b-test/b-test.ss')).is.false;
			expect(app2.vfs.exists('./src/base/b-plot/b-plot.ss')).is.true;
			expect(app2.vfs.exists('./src/base/b-plot/CHANGELOG.md')).is.true;
			expect(app2.vfs.exists('./src/base/b-plot/README.md')).is.true;
			expect(app2.vfs.readFile('./src/base/b-plot/b-plot.ts')).contains(
				'bPlot'
			);

			expect(app2.vfs.readFile('./src/base/b-plot/b-plot.styl')).contains(
				'b-plot'
			);
		});

		it('should not change extends', async () => {
			const app = getApplication({
				command: 'make',
				subject: 'block',
				name: 'test',
				extend: 'i-data'
			});

			await app.run();

			expect(app.vfs.readFile('./src/base/b-test/b-test.ts')).contains(
				'extends iData'
			);

			const app2 = getApplication({
				command: 'rename',
				name: 'test',
				newName: 'plot',
				extend: 'i-block'
			});

			await app2.run();
			expect(app2.vfs.readFile('./src/base/b-plot/b-plot.ts')).contains(
				'extends iData'
			);
		});
	});

	describe('Make test', () => {
		it('should create test without runners', async () => {
			const app = getApplication({
				path: 'src/base/b-slider',
				command: 'make-test',
				runners: []
			});

			await app.run();

			expect(app.vfs.exists('./src/base/b-slider/test/index.js')).is.true;
			expect(app.vfs.exists('./src/base/b-slider/test/runners')).is.false;
		});

		it('should create test with runners', async () => {
			const app = getApplication({
				path: 'src/base/b-slider',
				command: 'make-test',
				runners: ['analytics', 'events', 'render']
			});

			await app.run();

			expect(app.vfs.exists('./src/base/b-slider/test/index.js')).is.true;
			expect(app.vfs.exists('./src/base/b-slider/test/runners/analytics.js')).is
				.true;

			expect(app.vfs.exists('./src/base/b-slider/test/runners/events.js')).is
				.true;

			expect(app.vfs.exists('./src/base/b-slider/test/runners/render.js')).is
				.true;
		});
	});
});
