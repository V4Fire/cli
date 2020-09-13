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

	describe('Test reporters', () => {
		describe('silent', () => {
			it('should send nothing into output', (done) => {
				const app = getApplication();

				exec(
					'node',
					[
						app.vfs.resolve(__dirname, '../bin/cli'),
						'make',
						'page',
						'point',
						'--reporter',
						'silent'
					],
					(error, stdout) => {
						if (error) {
							throw error;
						}

						expect(app.vfs.exists('./src/pages/p-point/p-point.ss')).is.true;
						expect(stdout).equals('');

						done();
					}
				);
			});
		});

		describe('raw', () => {
			it('should send some information into output', (done) => {
				const app = getApplication();

				exec(
					'node',
					[
						app.vfs.resolve(__dirname, '../bin/cli'),
						'make',
						'page',
						'point',
						'--reporter',
						'raw'
					],
					(error, stdout) => {
						if (error) {
							throw error;
						}

						expect(app.vfs.exists('./src/pages/p-point/p-point.ss')).is.true;

						expect(
							stdout.replace(/\[[0-9]+m/g, '').replace(/[^a-z-A-Z/:.\n\s]/g, '')
						).matches(
							new RegExp(
								'Command:make\n' +
									'File:/(.*/)*src/pages/p-point/CHANGELOG.MD\n' +
									'File:/(.*/)*src/pages/p-point/README.MD\n' +
									'File:/(.*/)*src/pages/p-point/p-point.styl\n' +
									'File:/(.*/)*src/pages/p-point/p-point.ss\n' +
									'File:/(.*/)*src/pages/p-point/p-point.ts\n' +
									'File:/(.*/)*src/pages/p-point/index.js\n' +
									'Result: success\n'
							)
						);

						done();
					}
				);
			});
		});

		describe('json', () => {
			it('should not send only JSON into output', (done) => {
				const app = getApplication();

				exec(
					'node',
					[
						app.vfs.resolve(__dirname, '../bin/cli'),
						'make',
						'page',
						'point',
						'--reporter',
						'json'
					],
					(error, stdout) => {
						if (error) {
							throw error;
						}

						expect(app.vfs.exists('./src/pages/p-point/p-point.ss')).is.true;
						expect(stdout).equals('{"status":true,"data":{}}\n');

						done();
					}
				);
			});
		});
	});
});
