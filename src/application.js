const assert = require('assert').strict;
const path = require('path');
const reporters = require('./core/reporters/index');
const controllers = require('./controllers/index');
const { ucfirst } = require("./core/helpers");

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

			const ControllerName = `${ucfirst(command)}Controller`;

			const Controller = controllers[ControllerName];

			if (typeof Controller !== 'function') {
				throw new Error('Unknown controller: ' + ControllerName);
			}

			const controller = new Controller(this.config);

			await controller.run();

			this.sendToReporter({});

		} catch (e) {
			this.sendToReporter(e);
		}
	}

	sendToReporter(e) {
		const reporter = reporters[this.config.reporter];
		assert.equal(typeof reporter, 'function');
		reporter.call(this, e);
	}
}

exports.Application = Application;
