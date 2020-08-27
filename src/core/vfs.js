// eslint-disable-next-line import/no-nodejs-modules
const path = require('path');
const fs = require('fs-extra');

class VirtualFileSystem {
	/**
	 * Get file basepart
	 *
	 * @param {string} filepath
	 * @returns {string}
	 */
	basename(filepath) {
		return path.basename(filepath, this.extname(filepath));
	}

	/**
	 * Current file is directory
	 *
	 * @param {string} filepath
	 * @returns {boolean}
	 */
	isDirectory(filepath) {
		return fs.statSync(filepath).isDirectory();
	}

	/**
	 * File extension
	 *
	 * @param {string} filepath
	 * @returns {string}
	 */
	extname(filepath) {
		return path.extname(filepath);
	}

	/**
	 * File exists
	 *
	 * @param {string} filepath
	 * @returns {boolean}
	 */
	exists(filepath) {
		return fs.existsSync(filepath);
	}

	/**
	 * Rename file
	 *
	 * @param {string} source
	 * @param {string} target
	 * @returns {Promise<void>}
	 */
	rename(source, target) {
		return fs.rename(source, target);
	}

	/**
	 * Write content into file
	 *
	 * @param {string} filepath
	 * @param {string} data
	 */
	writeFile(filepath, data) {
		fs.writeFileSync(filepath, data);
	}

	/**
	 * Remove file
	 * @param {string} filepath
	 */
	unlink(filepath) {
		return fs.unlinkSync(filepath);
	}

	/**
	 * Read file content
	 *
	 * @param {string} filepath
	 * @returns {string}
	 */
	readFile(filepath) {
		return fs.readFileSync(filepath, 'utf8');
	}

	/**
	 * Return files and directories list from directory
	 *
	 * @param {string} filepath
	 * @returns {string[]}
	 */
	readdir(filepath) {
		return fs.readdirSync(filepath);
	}

	/**
	 * Make directory if it does not exist
	 *
	 * @param {string} filepath
	 * @returns {Promise<void>}
	 */
	ensureDir(filepath) {
		return fs.ensureDir(filepath);
	}

	/**
	 * Resolve path
	 *
	 * @param {string} args
	 * @returns {string}
	 */
	resolve(...args) {
		return path.resolve(...args);
	}

	/**
	 * Calculate relative path
	 *
	 * @param filepath
	 * @returns {string}
	 */
	pathByRoot(filepath) {
		const root = `${this.resolve(process.cwd(), 'src')}${path.sep}`;
		return this.resolve(filepath).replace(root, '') + path.sep;
	}
}

exports.VirtualFileSystem = VirtualFileSystem;
