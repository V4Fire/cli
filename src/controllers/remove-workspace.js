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
	{WorkspaceController} = require('../core/workspaceController');

require('@v4fire/core');

class RemoveWorkspaceController extends WorkspaceController {
	/**
	 * Remove workspace folder, package.json workspace field and reset package-lock
	 * @returns {Promise<void>}
	 */
	async run() {
		this.removeWorkspaceRoot();
		await this.clearPackageJSON();
		await this.clearLockFile();
		await this.clearComponentsLock();
		await this.installDependencies();
	}

	/**
	 * Remove workspace field from package.json of project
	 *
	 * @returns {void}
	 */
	async clearPackageJSON() {
		this.log.msg('Clear package.json from workspace...');

		await exec('git checkout HEAD package.json');

		this.log.msg('Cleared package.json!');
	}

	/**
	 * Remove workspace field from package.json of project
	 *
	 * @returns {!Promise<void>}
	 */
	 async clearLockFile() {
		this.log.msg('Clear yarn.lock from workspace...');

		await exec('git checkout HEAD yarn.lock');

		this.log.msg('Cleared yarn.lock!');
	}

	/**
	 * Remove workspace field from package.json of project
	 *
	 * @returns {!Promise<void>}
	 */
	 async clearComponentsLock() {
		this.log.msg('Clear components-lock.json...');

		await exec('git checkout HEAD components-lock.json');

		this.log.msg('Cleared components-lock.json!');
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
