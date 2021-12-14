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

class RemoveWorkspaceController extends Controller {
	/**
	 * Name of a folder where a workspace were initiated
	 * @type {string}
	 */
	workspaceRoot = this.config.root;

	/**
	 * Remove workspace folder, package.json workspace field and reset package-lock
	 * @returns {Promise<void>}
	 */
	async run() {
		this.removeWorkspaceRoot();
		this.clearPackageJSON();
		await this.clearPackageLock();
		await this.installDependencies();
	}

	/**
	 * Installs all dependencies of the project
	 * @returns {!Promise<void>}
	 */
	async installDependencies() {
		this.log.msg('Installing dependencies...');
		await exec('npm install');
	}

	/**
	 * Remove workspace field from package.json of project
	 *
	 * @returns {void}
	 */
	clearPackageJSON() {
		this.log.msg('Clear package.json from workspace...');

		const packageJSONPath = this.vfs.resolve('package.json');
		let rootPackageJSON;

		try {
			rootPackageJSON = this.vfs.readFile(packageJSONPath);
		} catch {
			throw new Error(
				`An error occurred when reading package.json of ${packageName}`
			);
		}

		const parsedPackageJSON = JSON.parse(rootPackageJSON);

		delete parsedPackageJSON.workspaces;

		this.vfs.writeFile(packageJSONPath, concatEmptyLine(JSON.stringify(parsedPackageJSON, null, 2)));

		this.log.msg('Cleared package.json!');
	}

	/**
	 * Concat empty line in string
	 * @param {string} str
	 *
	 * @returns {string}
	 */
	concatEmptyLine(str) {
		return `${str}\n`;
	}

	/**
	 * Remove workspace field from package.json of project
	 *
	 * @returns {!Promise<void>}
	 */
	 async clearPackageLock() {
		this.log.msg('Clear package-lock.json from workspace...');

		await exec('git reset HEAD package-lock.json');

		this.log.msg('Cleared package-lock.json!');
	}

	/**
	 * Remove a workspace folder
	 * @returns {void}
	 */
	removeWorkspaceRoot() {
		this.vfs.rmDir(this.workspaceRoot);
	}
}

module.exports = RemoveWorkspaceController;
