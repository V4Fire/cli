const util = require('util');
const exec = util.promisify(require('child_process').exec);

const {Controller} = require('../core/controller');

class CreateWorkspaceController extends Controller {
	/**
	* Name of the folder where workspace will be created
	* @type {string}
	*/
	workspaceRoot = this.config.root;

	async run() {
		console.log(this.workspaceRoot);
		this.createWorkspaceRoot();

		const dependencies = this.getDependencies();

		await Promise.all(dependencies.map(async (dependency) => {
			const {name} = this.getDependencyPackageInfo(dependency);
			const {gitURL, version} = this.getDependencyInfo(dependency);

			await this.cloneGitRepo(gitURL, version, name);

			await this.initWorkspace(name);
		}));

		await this.installDependencies();
	}

	/**
	* Clone git repository of dependency into workspace folder
	* @param {string} gitURL
	* @param {string} version
	* @param {string} packageName
	*
	* @returns {Promise<stdout, stderr>}
	*/
	async cloneGitRepo(gitURL, version, packageName) {
		this.log.msg(`Cloning ${packageName}...`);
		const command = `git clone ${gitURL} --single-branch --branch ${this.formatGitVersion(version)} ${this.workspaceRoot}/${packageName}`;

		try {
			await exec(command);
		} catch(err) {
			throw new Error(`Error occured when cloning repo with command:\n${command}`);
		}

		this.log.msg(`Done cloning ${packageName}!`);
	}

	/**
	* Install dependencies of the project
	*
	* @returns {Promise<stdout, stderr>}
	*/
	async installDependencies() {
		this.log.msg('Installing dependencies...');
		await exec('npm i');
	}

	/**
	* Format version of dependency extracted from package.json
	* for semver deps versions convert 3.4.5 to v3.4.5
	* for deps with branch do nothing
	* @param {string} version
	*
	* @returns {Promise<stdout, stderr>}
	*/
	formatGitVersion(version) {
		if (/\d+\.\d+\.\d+/.test(version)) {
			return `v${version}`;
		}

		return version;
	}

	/**
	* Init workspace for cloned package
	* @param {string} packageName
	*
	* @returns {Promise<stdout, stderr>}
	*/
	async initWorkspace(packageName) {
		this.log.msg(`Init workspace ${packageName}...`);
		await exec(`npm init -w ${this.workspaceRoot}/${packageName} --yes`);
		this.log.msg(`Done initing workspace for ${packageName}!`);
	}

	/**
	* Get info of dependency trying to get info from the root package.json
	* if no version found in the root package.json
	* trying to find info in package.json from package folder in node_modules
	* @param {string} packageName
	*
	* @returns {PackageInfo}
	*/
	getDependencyInfo(packageName) {
		let {version, gitURL} = this.getInfoFromRootPackageJSON(packageName);

		if (!gitURL || !version) {
			const packageInfo = this.getInfoFromPackage(packageName);
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
	* Get info about package from it package.json
	* @param {string} packageName
	*
	* @returns {PackageInfo}
	*/
	getInfoFromPackage(packageName) {
		const info = this.getDependencyPackageInfo(packageName);

		return {version: info.version, gitURL: this.getGitURLFromPackageJSON(info)};
	}

	/**
	* Get info about package from root package.json
	* @param {string} packageName
	*
	* @returns {PackageInfo}
	*/
	getInfoFromRootPackageJSON(packageName) {
		let version, gitURL, rootPackageJSON;

		try {
			rootPackageJSON = require(this.vfs.resolve('package.json'));
		} catch(err) {
			throw new Error(`Error occured when reading package.json of ${packageName}`);
		}

		const dependencyVersion = this.getDependencyVersion(rootPackageJSON, packageName);
		if (/:\/\//.test(dependencyVersion)) {
			const gitVersionURL = this.purifyGitURLFromPackageJSON(dependencyVersion);
			gitURL = this.createSSHGitURL(gitVersionURL);
			version = /#(.*)$/.exec(gitVersionURL)[1];

		} else {
			version = /\d+\.\d+\.\d+/.exec(dependencyVersion)[0];
		}

		return {version, gitURL};
	}

	/**
	* Create valid url for ssh cloning via git from url extracted from package.json
	* @param {string} gitURL
	*
	* @returns {string}
	*/
	createSSHGitURL(gitURL) {
		if (/git@git/.test(gitURL)) {
			return gitURL;
		}

		const validURL = `https://${gitURL.replace(/#.*$/, '')}`;
		const url = new URL(validURL);

		return `git@${url.host.replace('gitlab', 'git')}:${url.pathname.slice(1)}`;
	}

	/**
	* Extract dependency version from package.json
	* if dependency not exist return nothing
	* @param {object} packageJSON
	* @param {string} dependencyName
	*
	* @returns {string|undefined}
	*/
	getDependencyVersion(packageJSON, dependencyName) {
		let dependencyVersion;

		try {
			dependencyVersion = packageJSON.dependencies[dependencyName];
		} catch (err) { }

		return dependencyVersion;
	}

	/**
	* Get package.json of package from it folder in node_modules
	* @param {object} packageName
	*
	* @returns {string|undefined}
	*/
	getDependencyPackageInfo(packageName) {
		return require(this.vfs.resolve('node_modules', packageName, 'package.json'));
	}

	/**
	* Purify git url from protocol
	* @param {string} dependencyVersion
	*
	* @returns {string|undefined}
	*/
	purifyGitURLFromPackageJSON(dependencyVersion) {
		return /:\/\/(.*)/.exec(dependencyVersion)[1];
	}

	/**
	* Get dependencies of project readed from .pzlrrc config
	*
	* @returns {string[]}
	*/
	getDependencies() {
		if (this.config.package) {
			return [this.config.package];
		}

		const pzlrrcContent = this.vfs.readFile('.pzlrrc');
		const {dependencies} = JSON.parse(pzlrrcContent);

		return dependencies;
	}

	/**
	* Get git url of package from field repository in package.json
	* @param {string} packageJSON
	*
	* @returns {string|undefined}
	*/
	getGitURLFromPackageJSON(packageJSON) {
		const {repository} = packageJSON;
		let gitURL = repository;

		if (gitURL) {
			if (typeof gitURL === 'object') {
				gitURL = gitURL.url;
			}

			if (/:\/\//.test(gitURL)) {
				gitURL = this.purifyGitURLFromPackageJSON(gitURL);
			}

			gitURL = this.createSSHGitURL(gitURL);
		}

		return gitURL;
	}

	/**
	* Create workspace folder for cloning projects into
	*
	* @returns {void}
	*/
	createWorkspaceRoot() {
		this.vfs.ensureDir(this.workspaceRoot);
	}
}

module.exports = CreateWorkspaceController;

/**
 * @typedef {Object} PackageInfo
 * @property {string|undefined} gitURL - git url of package
 * @property {string|undefined} version - version of package
 */
