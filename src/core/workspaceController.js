const
	util = require('util'),
	exec = util.promisify(require('child_process').exec);
const {Controller} = require('./controller');

class WorkspaceController extends Controller {
	/**
	 * Name of a folder where a workspace will be created
	 * @type {string}
	 */
	workspaceRoot = this.config.root;

	/**
	 * Remove a workspace folder
	 * @returns {void}
	 */
	removeWorkspaceRoot() {
		this.vfs.rmDir(this.workspaceRoot);
	}

	/**
	 * Installs all dependencies of the project
	 * @returns {!Promise<void>}
	 */
	async installDependencies() {
		this.log.msg('Installing dependencies...');
		await exec('yarn');
	}

	/**
	 * Return root package.json
	 *
	 * @returns {Object}
	 */
	getRootPackageJSON() {
		const packageJSONPath = this.vfs.resolve('package.json');
		let rootPackageJSON;

		try {
			rootPackageJSON = this.vfs.readFile(packageJSONPath);
		} catch {
			throw new Error(
				`An error occurred when reading package.json of ${packageName}`
			);
		}

		return JSON.parse(rootPackageJSON);
	}

	/**
	 * Write new root package.json
	 *
	 * @returns {Object}
	 */
	writeRootPackageJSON(packageJSON) {
		const packageJSONPath = this.vfs.resolve('package.json');

		this.vfs.writeFile(packageJSONPath, this.concatNewLine(JSON.stringify(packageJSON, null, 2)));
	}

	/**
	 * Concat empty line in string
	 * @param {string} str
	 *
	 * @returns {string}
	 */
	concatNewLine(str) {
		return `${str}\n`;
	}
}

exports.WorkspaceController = WorkspaceController;
