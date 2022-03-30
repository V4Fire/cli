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

/**
 * @typedef {Object} PackageInfo
 * @property {(string|undefined)} gitURL - git URL of the package
 * @property {(string|undefined)} version - version of the package
 */

class CreateWorkspaceController extends WorkspaceController {
	/**
	 * Array of successfully bootstrapped workspace packages
	 */
	workspacePackages = [];

	/**
	 * Downloads the necessary dependencies and initializes a workspace
	 * @returns {Promise<void>}
	 */
	async run() {
		this.removeWorkspaceRoot();
		this.createWorkspaceRoot();

		const
			dependencies = this.getDependencies();

		await Promise.all(
			dependencies.map(async (dependency) => {
				const
					{name} = this.getDependencyPackageInfo(dependency),
					{gitURL, version, gitSSHURL} = this.getDependencyInfo(dependency);

				const gitBranch = await this.getBranchFromGit(gitURL, gitSSHURL, version, name);
				await this.cloneGitRepo(gitURL, gitSSHURL, gitBranch, name);
				this.workspacePackages.push(name);
			})
		);

		await this.initWorkspaces();
		await this.installDependencies();
	}

	/**
	 * Clones a git repository of the specified dependency into a workspace folder
	 *
	 * @param {string} gitURL - URL to the git repository to clone
	 * @param {string} branch - dependency git branch to clone
	 * @param {string} packageName - name of the cloned package
	 * @returns {!Promise<void>}
	 */
	async cloneGitRepo(gitURL, gitSSHURL, branch, packageName) {
		this.log.msg(`Cloning ${packageName}...`);

		const getCloneCommand = (url) => `git clone ${url} --single-branch --branch ${branch} ${this.workspaceRoot}/${packageName}`;

		try {
			await exec(getCloneCommand(gitSSHURL));

		} catch {
			this.log.msg(`Failed to clone repo ${packageName} from git by ssh, trying https...`);

			try {
				await exec(getCloneCommand(gitURL));

			} catch(err) {
				console.log(err);
				throw new Error(
					`An error occurred when cloning ${packageName} with command:\n${getCloneCommand(gitSSHURL)}`
				);
			}
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
	async getBranchFromGit(gitURL, gitSSHURL, version, packageName) {
		this.log.msg(`Getting the right version of a git branch/tag for ${packageName}...`);

		let
			stdout;
		const getBranchesCommand = (url) => `git ls-remote ${url}`;

		try {
			const result = await exec(getBranchesCommand(gitSSHURL));
			stdout = result.stdout;

		} catch {
			this.log.msg(`Failed to fetch info about ${packageName} from git by ssh, trying https...`);

			try {
				const result = await exec(getBranchesCommand(gitURL));
				stdout = result.stdout;

			} catch {
				throw new Error(`An error occurred when getting a git branch for ${packageName} with command:\n${getBranchesCommand(gitURL)}`);
			}
		}

		const
			branches = stdout.split('\n'),
			versionRegExp = new RegExp(RegExp.escape(version), 'gm'),
			fullBranchName = branches.find((branch) => versionRegExp.exec(branch)),
			branch = fullBranchName.split('\t')[1],
			gitBranch = /refs\/(?:heads|tags)\/(.*)/.exec(branch)[1];

		this.log.msg(`A branch for ${packageName} is ${gitBranch}`);
		return gitBranch;
	}

	/**
	 * Initialized workspace for the specified package
	 *
	 * @param {string} packageName
	 * @returns {!Promise<void>}
	 */
	initWorkspaces() {
		this.log.msg('Initialize a workspaces...');

		const rootPackageJSON = this.getRootPackageJSON();
		rootPackageJSON.workspaces = [];

		this.workspacePackages.forEach((packageName) => {
			rootPackageJSON.workspaces.push(`${this.workspaceRoot}/${packageName}`);
			rootPackageJSON.dependencies[packageName] = 'workspace:*';
		});

		this.writeRootPackageJSON(rootPackageJSON);

		this.log.msg('The workspaces is successfully initialized');
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
			{version, gitSSHURL, gitURL} = this.getInfoFromRootPackageJSON(packageName);

		if (!gitURL || !version) {
			const
				packageInfo = this.getInfoFromPackage(packageName);

			if (!gitURL) {
				gitURL = packageInfo.gitURL;
				gitSSHURL = packageInfo.gitSSHURL;
			}

			if (!version) {
				version = packageInfo.version;
			}
		}

		return {version, gitSSHURL, gitURL};
	}

	/**
	 * Returns information of the specified package from its `package.json`
	 *
	 * @param {string} packageName
	 * @returns {PackageInfo}
	 */
	getInfoFromPackage(packageName) {
		const info = this.getDependencyPackageInfo(packageName);
		const gitURL = this.getGitURLFromPackageJSON(info);

		return {
			version: info.version,
			gitURL: this.createValidGitURL(gitURL),
			gitSSHURL: this.createSSHGitURL(gitURL)
		};
	}

	/**
	 * Returns information of the specified package from the root `package.json`
	 *
	 * @param {string} packageName
	 * @returns {PackageInfo}
	 */
	getInfoFromRootPackageJSON(packageName) {
		let version, gitURL, gitSSHURL;
		const rootPackageJSON = this.getRootPackageJSON();

		const dependencyVersion = this.getDependencyVersion(
			rootPackageJSON,
			packageName
		);

		if (this.hasURLProtocol(dependencyVersion)) {
			gitSSHURL = this.createSSHGitURL(dependencyVersion);
			gitURL = this.createValidGitURL(dependencyVersion);
			version = /(?<=#).*$/.exec(dependencyVersion)[0];

		} else {
			version = /\d+\.\d+\.\d+(?:-[\w-]+)?$/.exec(dependencyVersion)[0];
		}

		return {version, gitURL, gitSSHURL};
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

	createValidGitURL(gitURL) {
		if (this.hasURLProtocol(gitURL)) {
			gitURL = /(?<=:\/\/).*/.exec(gitURL)[0];
		}

		return `https://${gitURL.replace(/#.*$/, '')}`;
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
