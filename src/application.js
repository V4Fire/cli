const assert = require('assert').strict;
const reporters = require('./core/reporters/index');
const controllers = require('./controllers/index');
const {Config} = require('./core/config');
const {VirtualFileSystem} = require('./core/vfs');
const {ucfirst, camelize} = require('./core/helpers');
const {Logger} = require('./core/log');

class Application {
	/**
	 * @type {VirtualFileSystem}
	 */
	vfs;

	/**
	 * @type {Logger}
	 */
	log;

	/**
	 * @param {IConfig} config
	 * @param {VirtualFileSystem} vfs
	 */
	constructor(config, vfs = new VirtualFileSystem()) {
		this.config = new Config(config, vfs);
		this.vfs = vfs;
		this.log = new Logger(this.config.reporter);
	}

	async run() {
		try {
			const {command} = this.config;

			this.log.info(`Command:${command}`);

			const ControllerName = `${ucfirst(camelize(command))}Controller`;

			const Controller = controllers[ControllerName];

			if (typeof Controller !== 'function') {
				throw new Error(`Unknown controller: ${ControllerName}`);
			}

			const controller = new Controller(this.config, this.vfs, this.log);

			await controller.run();

			this.sendToReporter({});

			this.log.info('Result: success');
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
