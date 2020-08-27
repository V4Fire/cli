const {camelize, ucfirst} = require('./helpers');

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
			.replace(/base\//g, this.vfs.pathByRoot(this.config.path))
			.replace(/{Date}/g, new Date().toISOString().substr(0, 10))
			.replace(RegExp(defName, 'g'), newName)
			.replace(RegExp(camelize(defName), 'g'), camelize(newName))
			.replace(
				RegExp(ucfirst(camelize(defName)), 'g'),
				ucfirst(camelize(newName))
			);

		if (defExtend) {
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
