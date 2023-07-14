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
	 * Remove directory
	 *
	 * @param {string} filepath
	 */
	rmDir(dirPath) {
		// eslint-disable-next-line no-empty-function
		return fs.rm(dirPath, {recursive: true}, () => {});
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
	 * Scan directory for files by glob pattern
	 *
	 * @param {string} pattern
	 * @returns {string[]}
	 */
	getFilesByGlobPattern(pattern) {
		return glob.sync(pattern);
	}

	/**
	 * Finds target name in directory recursive and returns path of first match
	 *
	 * @param {string} source
	 * @param {string} target
	 * @returns {string | undefined}
	 */
	findInDir(source, target) {
		const
			sourcePath = this.resolve(source);

		if (!this.isDirectory(sourcePath)) {
			return sourcePath.split(path.sep).at(-1) === target ? sourcePath : undefined;
		}

		const
			stack = this.readdir(sourcePath);

		while (stack.length > 0) {
			const
				cur = stack.pop(),
				curPath = this.resolve(sourcePath, cur);

			if (cur.split(path.sep).at(-1) === target) {
				return curPath;
			}

			if (this.isDirectory(curPath)) {
				stack.push(...this.readdir(curPath).map((chunk) => `${cur}${path.sep}${chunk}`));
			}
		}

		return undefined;
	}

	/**
	 * Copies files and directories from source to destination
	 *
	 * @param {string} source
	 * @param {string} destination
	 * @param {CopyDirOptions} [options]
	 *
	 * @returns {Promise<void>}
	 */
	copyDir(source, destination, options) {
		return this.#copyDir(source, destination, options);
	}

	/**
	 * Copies files and directories from source to destination
	 *
	 * @param {string} source
	 * @param {string} destination
	 * @param {CopyDirOptions} [options]
	 * @param {string[]} [pathStack]
	 *
	 * @returns {Promise<void>}
	 */
	async #copyDir(source, destination, options = {}, pathStack = []) {
		const
			{onDataWrite, afterEachCopy, withFolders = true} = options;

		const
			curPath = this.resolve(source, ...pathStack),
			isDirectory = this.isDirectory(curPath);

		if (!isDirectory) {
			const
				fileData = this.readFile(curPath),
				destPath = this.resolve(destination, ...pathStack);

			await this.ensureDir(this.resolve(destination, ...pathStack.slice(0, pathStack.length - 1)));

			this.writeFile(destPath, typeof onDataWrite === 'function' ? onDataWrite(fileData) : undefined);

			if (typeof afterEachCopy === 'function') {
				afterEachCopy(destPath);
			}

			return;
		}

		const
			dir = this.readdir(curPath);

		for (const file of dir) {
			if (!withFolders && this.isDirectory(this.resolve(curPath, file))) {
				continue;
			}

			await this.#copyDir(source, destination, options, [...pathStack, file]);
		}
	}
}

exports.VirtualFileSystem = VirtualFileSystem;
