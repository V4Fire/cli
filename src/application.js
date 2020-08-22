const assert = require('assert').strict;
const path = require('path');

class Application {
	/**
	 * @param {Config} config
	 */
	constructor(config) {
		this.config = config;
	}

	async run() {
		try {
			const
				[command] = this.config._;

			if (!this.config.path) {
				this.config.path =
					path.join(process.cwd(), this.config.subject === 'page' ? './src/pages' : './src/base')

			} else {
				this.config.path = path.resolve(this.config.path);
			}

			assert(/make|rename/.test(command));

			const Controller = require(`./controllers/${command}/${command}`);

			assert.equal(typeof Controller, 'function');

			const controller = new Controller(this.config);

			await controller.run();

			this.sendToReporter({});

		} catch (e) {
			this.sendToReporter(e);
		}
	}

	sendToReporter(e) {
		const reporter = require('./core/reporters/' + this.config.reporter + '.js')[this.config.reporter];
		assert.equal(typeof reporter, 'function');
		reporter(e);
	}
}

exports.Application = Application;
