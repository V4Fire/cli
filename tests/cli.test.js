const exec = require('child_process').execFile;
const {expect} = require('chai');
const {getApplication} = require('./staff/helpers');

describe('Cli test', () => {
	describe('Exec by command line', () => {
		describe('Make', () => {
			it('should create component', (done) => {
				const app = getApplication();

				exec(
					'node',
					[
						app.vfs.resolve(__dirname, '../bin/cli'),
						'make',
						'page',
						'point',
						'--debug',
						'--template',
						'default',
						'--extend',
						'i-static-page',
						'--override',
						'true'
					],
					(error) => {
						console.log('here');
						if (error) {
							throw error;
						}

						expect(app.vfs.exists('./src/pages/p-point/p-point.ss')).is.true;

						done();
					}
				);
			});
		});

		describe('Rename', () => {
			it('should rename component', (done) => {
				const app = getApplication({
					command: 'make',
					subject: 'block',
					name: 'point'
				});

				app.run().then(() => {
					expect(app.vfs.exists('./src/base/b-point/b-point.ss')).is.true;

					exec(
						'node',
						[
							app.vfs.resolve(__dirname, '../bin/cli'),
							'rename',
							'point',
							'time'
						],
						(error) => {
							if (error) {
								throw error;
							}

							expect(app.vfs.exists('./src/base/b-point/b-point.ss')).is.false;
							expect(app.vfs.exists('./src/base/b-time/b-time.ss')).is.true;

							done();
						}
					);
				});
			});
		});
	});
});
