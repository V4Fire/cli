/**
 * @typedef { import("./interface").Config }
 * @interface IConfig
 */
class Config {
	/**
	 * @type {IConfig}
	 */
	opt;

	/**
	 * @type {VirtualFileSystem}
	 */
	vfs;

	get command() {
		const command = this.commandNative;

		if (command && /-/.test(command)) {
			return command.split('-')[0];
		}

		return command || 'make';
	}

	get commandNative() {
		const [command] = this.opt._ || [this.opt.command];
		return command;
	}

	get path() {
		if (!this.opt.path) {
			return this.vfs.resolve(
				process.cwd(),
				(() => {
					switch (this.subject) {
						case 'page':
							return './src/pages';

						case 'block':
							return './src/components';

						default:
							return './';
					}
				})()
			);
		}

		return this.vfs.resolve(this.opt.path);
	}

	get subject() {
		if (!this.opt.subject) {
			const command = this.commandNative;

			if (command && /-/.test(command)) {
				return command.split('-')[1];
			}

			return 'block';
		}

		return this.opt.subject;
	}

	get reporter() {
		return this.opt.reporter || 'json';
	}

	get template() {
		return this.opt.template || 'default';
	}

	get extend() {
		if (!this.opt.extend || this.opt.extend === 'default') {
			return this.subject === 'block' ? 'i-block' : 'i-dynamic-page';
		}

		return this.opt.extend;
	}

	/**
	 * @param {IConfig} options
	 * @param {VirtualFileSystem} vfs
	 */
	constructor(options, vfs) {
		this.opt = options;
		this.vfs = vfs;

		Object.keys(options).forEach((key) => {
			const descriptor = Object.getOwnPropertyDescriptor(Config.prototype, key);

			if (!descriptor) {
				this[key] = options[key];
			}
		});
	}
}

exports.Config = Config;
