const assert = require('assert').strict;
const npm = require('npm');
const {Controller} = require('../core/controller');

class MakeAppController extends Controller {
	/** @override **/
	async run() {
		assert(/^[a-z\-0-9]+$/i.test(this.config.name));
		const installPath = this.vfs.resolve(this.config.path, this.config.name);
		const source = this.vfs.resolve(__dirname, '../templates/app');

		this.vfs.ensureDir(installPath);

		this.copyFolder(source, installPath, this.config.name, true);

		if (!this.config.noInstall) {
			this.log.warn('Install client, core and another dependencies:');

			await new Promise((resolve) => {
				npm.load((er) => {
					if (er) {
						throw er;
					}

					npm.commands.install(
						installPath,
						[
							'@v4fire/core',
							'@v4fire/client',
							'@v4fire/linters',
							'@v4fire/cli',
							'stlint-v4fire',
							'express',
							'express-http-proxy',
							'express-http-proxy',
							'parallel-webpack'
						],
						(er) => {
							if (er) {
								throw er;
							}

							resolve();
						}
					);

					npm.on('log', (message) => {
						this.log.info(message);
					});
				});
			});

			this.log.warn('V4fire application ready for work.');
			this.log.info(`Run: \`cd ${this.config.name} && npm run build\``);
		} else {
			this.log.warn(
				'V4fire application ready for work but need install dependencies.'
			);

			this.log.info(`Run \`cd ${this.config.name} && yarn && npm run build\``);
		}

		this.log.info('After build run: `npm start`');
	}
}

module.exports = MakeAppController;
