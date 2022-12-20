/*!
 * V4Fire cli
 * https://github.com/V4Fire/cli
 *
 * Released under the MIT license
 * https://github.com/V4Fire/cli/blob/master/LICENSE
 */

const
	util = require('util'),
	spawn = util.promisify(require('child_process').spawn);

const
	{Controller} = require('../core/controller');

require('@v4fire/core');

class UpYarnGitDependencies extends Controller {
	/**
	 * List of Git project dependencies
	 */
	gitDependencies = [];

	/**
	 * Path to the project lock file
	 */
	lockFilePath = this.vfs.resolve('yarn.lock');

	/**
	 * Path to the project `package.json` file
	 */
	packageJSONPath = this.vfs.resolve('package.json');

	/**
	 * All dependencies taken from the project `package.json`
	 * @returns {!Object}
	 */
	get projectDependencies() {
		let
			packageJSON;

		try {
			packageJSON = this.vfs.readFile(this.packageJSONPath);

		} catch {
			throw new Error('An error occurred when reading the project `package.json`');
		}

		const parsedPackageJSON = JSON.parse(packageJSON);

		return {
			...parsedPackageJSON.dependencies,
			...parsedPackageJSON.devDependencies,
			...parsedPackageJSON.optionalDependencies
		};
	}

	/**
	 * The contents of the dependency lock file
	 * @returns {!Object}
	 */
	get lockFile() {
		let
			lockFile;

		try {
			lockFile = this.vfs.readFile(this.lockFilePath);

		} catch {
			throw new Error('An error occurred when reading the dependency lock file');
		}

		return lockFile;
	}

	/**
	 * Updates all Git dependencies
	 * @returns {!Promise<void>}
	 */
	async run() {
		this.extractGitDependencies();
		this.removeGitDependenciesFromLockFile();
		this.log.info(`Dependencies for update: ${this.gitDependencies.join(', ')}`);

		await this.installDependencies();
	}

	/**
	 * Extracts all Git dependencies from the project `package.json`
	 * @returns {Array}
	 */
	extractGitDependencies() {
		const {projectDependencies} = this;

		Object.forEach(projectDependencies, (el, key) => {
			if (/^(?:git|https)/.test(el)) {
				this.gitDependencies.push(key);
			}
		});
	}

	/**
	 * Removes all Git dependencies from the project lockfile
	 */
	removeGitDependenciesFromLockFile() {
		const lines = this.lockFile.split('\n');

		this.gitDependencies.forEach((dependency) => {
			const
				startIndex = lines.findIndex((line) => line.startsWith(`"${dependency}`)),
				endIndex = lines.indexOf('', startIndex);

			lines.splice(startIndex, endIndex - startIndex);
		});

		return this.updateLockFile(lines.join('\n'));
	}

	/**
	 * Synchronizes the passed contents of the lock file with the file system
	 *
	 * @param {string} fileContent
	 */
	updateLockFile(fileContent) {
		this.vfs.writeFile(this.lockFilePath, fileContent);
	}

	/**
	 * Installs all project dependencies
	 * @returns {!Promise<void>}
	 */
	async installDependencies() {
		this.log.msg('Installing dependencies...');
		await spawn('yarn', {stdio: 'inherit'});
	}
}

module.exports = UpYarnGitDependencies;
