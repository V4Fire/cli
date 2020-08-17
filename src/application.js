const assert = require('assert').strict;

exports.Application = class Application {
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
