const {camelize, ucfirst, gitUser} = require('./helpers');

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
	 * @type {./log/Logger}
	 */
	log;

	get prefix() {
		return this.config.subject === 'page' ? 'p' : 'b';
	}

	/**
	 * @param {IConfig} config
	 * @param {VirtualFileSystem} vfs
	 * @param {Logger} log
	 */
	constructor(config, vfs, log) {
		this.config = config;
		this.vfs = vfs;
		this.log = log;
	}

	/**
	 * @param {string} name
	 * @param {string} [prefix]
	 * @returns {string}
	 */
	resolveName(name, prefix = 'b') {
		return /^[bp]-/.test(name) ? name : `${prefix}-${name}`;
	}

	/**
	 * Rename all names to target name
	 *
	 * @param {string} content
	 * @param {string} newName
	 * @param {string} defName
	 * @param {false|string} defExtend
	 * @returns {string}
	 * @protected
	 */
	replaceNames(content, newName, defName = 'b-name', defExtend = 'i-block') {
		let result = content
			.replace(
				/base\//g,
				this.vfs.toPosixPath(this.vfs.pathByRoot(this.config.path))
			)
			.replace(/{Date}/g, new Date().toISOString().substr(0, 10))
			.replace(/@YourName/g, gitUser.name)
			.replace(/@YourFullName/g, `${gitUser.name}<${gitUser.email}>`)
			.replace(RegExp(defName, 'g'), newName)
			.replace(RegExp(camelize(defName), 'g'), camelize(newName))
			.replace(
				RegExp(ucfirst(camelize(defName)), 'g'),
				ucfirst(camelize(newName))
			);

		// Replace extend
		if (defExtend && this.config.subject !== 'app') {
			result = result
				.replace(RegExp(defExtend, 'g'), this.config.extend)
				.replace(
					RegExp(camelize(defExtend), 'g'),
					camelize(this.config.extend)
				);
		}

		return result;
	}
}

exports.Controller = Controller;
