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

class CreateWorkspaceController extends Controller {
	/**
	 * Name of a folder where a workspace will be created
	 * @type {string}
	 */
	workspaceRoot = this.config.root;

	/**
	 * Downloads the necessary dependencies and initializes a workspace
	 * @returns {Promise<void>}
	 */
	async run() {
		await this.createWorkspaceRoot();

		const
			dependencies = this.getDependencies();

		await Promise.all(
			dependencies.map(async (dependency) => {
				const
					{name} = this.getDependencyPackageInfo(dependency),
					{gitURL, version} = this.getDependencyInfo(dependency);

				const gitBranch = await this.getBranchFromGit(gitURL, version, name);
				await this.cloneGitRepo(gitURL, gitBranch, name);
				await this.initWorkspace(name);
			})
		);

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
	 * Clones a git repository of the specified dependency into a workspace folder
	 *
	 * @param {string} gitURL - URL to the git repository to clone
	 * @param {string} branch - dependency git branch to clone
	 * @param {string} packageName - name of the cloned package
	 * @returns {!Promise<void>}
	 */
	async cloneGitRepo(gitURL, branch, packageName) {
		this.log.msg(`Cloning ${packageName}...`);

		const command = `git clone ${gitURL} --single-branch --branch ${branch} ${this.workspaceRoot}/${packageName}`;

		try {
			await exec(command);

		} catch {
			throw new Error(
				`An error occurred when cloning ${packageName} with command:\n${command}`
			);
		}

		this.log.msg(`${packageName} is successfully cloned`);
	}

	/**
	 * Returns true if the specified string contains a URL protocol declaration
	 *
	 * @param {string} str
	 * @returns {boolean}
	 */
	hasURLProtocol(str) {
		return /:\/\//.test(str);
	}

	/**
	 * Returns a git branch name to clone based on the specified version and name from `package.json`
	 *
	 * @param {string} gitURL - URL to the git repository to clone
	 * @param {string} version - version of the package from `package.json`
	 * @param {string} packageName - name of the package from `package.json`
	 * @returns {Promise<string>}
	 */
	async getBranchFromGit(gitURL, version, packageName) {
		this.log.msg(`Getting the right version of a git branch/tag for ${packageName}...`);

		let
			gitBranch;

		try {
			const
				{stdout} = await exec(`git ls-remote ${gitURL}`);

			const
				branches = stdout.split('\n'),
				versionRegExp = new RegExp(RegExp.escape(version), 'gm'),
				fullBranchName = branches.find((branch) => versionRegExp.exec(branch)),
				branch = fullBranchName.split('\t')[1];

			gitBranch = /refs\/(?:heads|tags)\/(.*)/.exec(branch)[1];

		} catch {
			throw new Error(`An error occurred when getting a git branch for ${packageName}`);
		}

		this.log.msg(`A branch for ${packageName} is ${gitBranch}`);
		return gitBranch;
	}

	/**
	 * Initialized workspace for the specified package
	 *
	 * @param {string} packageName
	 * @returns {!Promise<void>}
	 */
	async initWorkspace(packageName) {
		this.log.msg(`Initialize a workspace for ${packageName}...`);

		await exec(`npm init -w ${this.workspaceRoot}/${packageName} --yes`);

		this.log.msg(`The workspace is successfully initialized for ${packageName}`);
	}

	/**
	 * Returns information of the specified package.
	 * The method tries to extract info from the root `package.json`.
	 * If no version is found, it will try to find info in package.json from a package folder in `node_modules`.
	 *
	 * @param {string} packageName
	 * @returns {PackageInfo}
	 */
	getDependencyInfo(packageName) {
		let
			{version, gitURL} = this.getInfoFromRootPackageJSON(packageName);

		if (!gitURL || !version) {
			const
				packageInfo = this.getInfoFromPackage(packageName);

			if (!gitURL) {
				gitURL = packageInfo.gitURL;
			}

			if (!version) {
				version = packageInfo.version;
			}
		}

		return {version, gitURL};
	}

	/**
	 * Returns information of the specified package from its `package.json`
	 *
	 * @param {string} packageName
	 * @returns {PackageInfo}
	 */
	getInfoFromPackage(packageName) {
		const info = this.getDependencyPackageInfo(packageName);
		return {version: info.version, gitURL: this.getGitURLFromPackageJSON(info)};
	}

	/**
	 * Returns information of the specified package from the root `package.json`
	 *
	 * @param {string} packageName
	 * @returns {PackageInfo}
	 */
	getInfoFromRootPackageJSON(packageName) {
		let version, gitURL, rootPackageJSON;

		try {
			rootPackageJSON = require(this.vfs.resolve('package.json'));

		} catch {
			throw new Error(
				`An error occurred when reading package.json of ${packageName}`
			);
		}

		const dependencyVersion = this.getDependencyVersion(
			rootPackageJSON,
			packageName
		);

		if (this.hasURLProtocol(dependencyVersion)) {
			gitURL = this.createSSHGitURL(dependencyVersion);
			version = /(?<=#).*$/.exec(dependencyVersion)[0];

		} else {
			version = /\d+\.\d+\.\d+(?:-[\w-]+)?$/.exec(dependencyVersion)[0];
		}

		return {version, gitURL};
	}

	/**
	 * Returns normalized URL to clone a repository via SSH by the passed one
	 *
	 * @param {string} gitURL
	 * @returns {string}
	 */
	createSSHGitURL(gitURL) {
		if (this.hasURLProtocol(gitURL)) {
			gitURL = /(?<=:\/\/).*/.exec(gitURL)[0];
		}

		if (/git@git/.test(gitURL)) {
			return gitURL;
		}

		const
			validURL = `https://${gitURL.replace(/#.*$/, '')}`,
			url = new URL(validURL);

		return `git@${url.host.replace('gitlab', 'git')}:${url.pathname.slice(1)}`;
	}

	/**
	 * Extracts a dependency version from the passed `package.json` object.
	 * The method will return `undefined` if the dependency doesn't exist.
	 *
	 * @param {object} packageJSON
	 * @param {string} dependencyName
	 * @returns {(string|undefined)}
	 */
	getDependencyVersion(packageJSON, dependencyName) {
		let dependencyVersion;

		try {
			dependencyVersion = packageJSON.dependencies[dependencyName];
		} catch {}

		return dependencyVersion;
	}

	/**
	 * Returns an `package.json` object by the specified package
	 *
	 * @param {string} packageName
	 * @returns {(string|undefined)}
	 */
	getDependencyPackageInfo(packageName) {
		return require(this.vfs.resolve('node_modules', packageName, 'package.json'));
	}

	/**
	 * Returns a list of project dependencies from its `.pzlrrc` config
	 * @returns {string[]}
	 */
	getDependencies() {
		if (this.config.package) {
			return [this.config.package];
		}

		const {config: {dependencies}} = require('@pzlr/build-core');

		return dependencies;
	}

	/**
	 * Returns a git URL of the specified package from its `package.json`
	 *
	 * @param {string} packageJSON
	 * @returns {(string|undefined)}
	 */
	getGitURLFromPackageJSON(packageJSON) {
		const {repository} = packageJSON;
		let gitURL = repository;

		if (gitURL) {
			if (typeof gitURL === 'object') {
				gitURL = gitURL.url;
			}

			gitURL = this.createSSHGitURL(gitURL);
		}

		return gitURL;
	}

	/**
	 * Creates a workspace folder to clone projects into
	 * @returns {Promise<void>}
	 */
	async createWorkspaceRoot() {
		await this.vfs.ensureDir(this.workspaceRoot);
	}
}

module.exports = CreateWorkspaceController;
