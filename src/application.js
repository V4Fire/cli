const assert = require('assert').strict;
const reporters = require('./core/reporters/index');
const controllers = require('./controllers/index');
const {Config} = require('./core/config');
const {VirtualFileSystem} = require('./core/vfs');
const {ucfirst} = require('./core/helpers');

class Application {
	/**
	 * @type {VirtualFileSystem}
	 */
	vfs;

	/**
	 * @param {IConfig} config
	 * @param {VirtualFileSystem} vfs
	 */
	constructor(config, vfs = new VirtualFileSystem()) {
		this.config = new Config(config, vfs);
		this.vfs = vfs;
	}

	async run() {
		try {
			const {command} = this.config;

			const ControllerName = `${ucfirst(command)}Controller`;

			const Controller = controllers[ControllerName];

			if (typeof Controller !== 'function') {
				throw new Error(`Unknown controller: ${ControllerName}`);
			}

			const controller = new Controller(this.config, this.vfs);

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
