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

			const app2 = getApplication({
				command: 'rename',
				name: 'test',
				newName: 'plot'
			});

			await app2.run();

			expect(app2.vfs.exists('./src/base/b-test/b-test.ss')).is.false;
			expect(app2.vfs.exists('./src/base/b-plot/b-plot.ss')).is.true;
			expect(app.vfs.readFile('./src/base/b-plot/b-plot.ts')).contains('bPlot');
			expect(app.vfs.readFile('./src/base/b-plot/b-plot.styl')).contains(
				'b-plot'
			);
		});
	});
});
