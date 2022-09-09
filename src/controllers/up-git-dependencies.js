/*!
 * V4Fire cli
 * https://github.com/V4Fire/cli
 *
 * Released under the MIT license
 * https://github.com/V4Fire/cli/blob/master/LICENSE
 */

const
	util = require('util'),
	exec = util.promisify(require('child_process').exec);

const
	{Controller} = require('../core/controller');

require('@v4fire/core');

/**
 * @typedef {Object} PackageInfo
 * @property {(string|undefined)} gitURL - git URL of the package
 * @property {(string|undefined)} version - version of the package
 */

 class UpGitDependencies extends Controller {
	/**
	 * Array of git dependencies
	 */
	gitDependencies = [];

	/**
	 * Path to lock file of project
	 */
	lockFilePath = this.vfs.resolve('yarn.lock');

	/**
	 * Pth to package.json of project
	 */
	packageJSONPath = this.vfs.resolve('package.json');

	/**
	 * Update all git dependencies
	 * @returns {Promise<void>}
	 */
	async run() {
		this.calculateGitDependencies();
		this.removeDependenciesFromLockFile();

		await this.installDependencies();
	}

	/**
	 * Extract git dependencies from package.json
	 *
	 * @returns {Array}
	 */
	 calculateGitDependencies() {
		const
			dependencies = this.getDependencies();

		for (const key in dependencies) {
			const value = dependencies[key];

			if (/^((git)|(https))/.exec(value) !== null) {
				this.gitDependencies.push(key);
			}
		}
	}

	/**
	 * Returns content of package.json
	 *
	 * @returns {Object}
	 */
	getDependencies() {
		let
			packageJSON;

		try {
			packageJSON = this.vfs.readFile(this.packageJSONPath);

		} catch {
			throw new Error('An error occurred when reading package.json');
		}

		const parsedPackageJSON = JSON.parse(packageJSON);

		return {
			...parsedPackageJSON.dependencies,
			...parsedPackageJSON.devDependencies,
			...parsedPackageJSON.optionalDependencies
		};
	}

	/**
	 * Returns content of lockfile
	 *
	 * @returns {Object}
	 */
	getLockFile() {
		let
			lockFile;

		try {
			lockFile = this.vfs.readFile(this.lockFilePath);

		} catch {
			throw new Error('An error occurred when reading yarn.lock');
		}

		return lockFile;
	}

	/**
	 * Remove git dependencies from lockfile
	 */
	removeDependenciesFromLockFile() {
		const
			lockFile = this.getLockFile(),
			lines = lockFile.split('\n');

		this.gitDependencies.forEach((dependency) => {
			const startIndex = lines.findIndex((line) => line.startsWith(`"${dependency}`));
			const endIndex = lines.indexOf('', startIndex);

			lines.splice(startIndex, endIndex - startIndex);
		});

		return this.writeLockFile(lines.join('\n'));
	}

	/**
	 * Write updated lockfile on filesystem
	 */
	writeLockFile(fileContent) {
		this.vfs.writeFile(this.lockFilePath, fileContent);
	}

	/**
	 * Installs all dependencies of the project
	 *
	 * @returns {!Promise<void>}
	 */
	 async installDependencies() {
		this.log.msg('Installing dependencies...');
		await exec('yarn');
	}
}

module.exports = UpGitDependencies;
