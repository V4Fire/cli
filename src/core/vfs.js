// eslint-disable-next-line import/no-nodejs-modules
const path = require('path');
const fs = require('fs-extra');
const glob = require('glob');

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
	 * Get directory name from path
	 *
	 * @param {string} filePath
	 * @returns {string}
	 */
	dirname(filePath) {
		return path.dirname(filePath);
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
	 * @param {string|object} data
	 */
	writeFile(filepath, data) {
		fs.writeFileSync(
			filepath,
			typeof data === 'string' ? data : JSON.stringify(data, null, '\t')
		);
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
	 * @param {string} filepath
	 * @returns {string}
	 */
	pathByRoot(filepath) {
		const root = `${this.resolve(process.cwd(), 'src')}${path.sep}`;

		return this.resolve(filepath).replace(root, '') + path.sep;
	}

	/**
	 * Converts any given path to posix path (e.g. replaces `\` with `/`)
	 *
	 * @param {string} filepath
	 * @returns {string}
	 */
	toPosixPath(filepath) {
		return filepath.split(path.sep).join(path.posix.sep);
	}

	/**
	 * Removes trailing separator from path string
	 *
	 * @param {string} filepath
	 * @returns {string}
	 */
	removeTrailingSep(filepath) {
		return filepath.replace(new RegExp(`${path.sep}$`), '');
	}

	/**
	 * Scan directory for all file by glob pattern
	 *
	 * @param {string} pattern
	 * @returns {string[]}
	 */
	getFilesByGlobPatter(pattern) {
		return glob.sync(pattern);
	}
}

exports.VirtualFileSystem = VirtualFileSystem;
