/**
 * @typedef { import("./interface").Config } Config
 */
exports.Controller = class Controller {
	/**
	 * @type {Config}
	 */
	config;

	/**
	 * @param {Config} config
	 */
	constructor(config) {
		this.config = config;
	}

	/**
	 * @param {string} name
	 * @param {string} [prefix]
	 * @returns {string}
	 */
	resolveName(name, prefix = 'b'){
		return /^[bp]-/.test(name) ? name : prefix + '-' + name;
	}
}
