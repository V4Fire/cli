/**
 * @typedef { import("./interface").Config }
 */
class Controller {
	/**
	 * @type {IConfig}
	 */
	config;

	/**
	 * @type {VirtualFileSystem}
	 */
	vfs;

	/**
	 * @param {IConfig} config
	 * @param {VirtualFileSystem} vfs
	 */
	constructor(config, vfs) {
		this.config = config;
		this.vfs = vfs;
	}

	/**
	 * @param {string} name
	 * @param {string} [prefix]
	 * @returns {string}
	 */
	resolveName(name, prefix = 'b') {
		return /^[bp]-/.test(name) ? name : `${prefix}-${name}`;
	}
}

exports.Controller = Controller;
