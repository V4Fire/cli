/*!
 * V4Fire cli
 * https://github.com/V4Fire/cli
 *
 * Released under the MIT license
 * https://github.com/V4Fire/cli/blob/master/LICENSE
 */

const
	util = require('util'),
	exec = util.promisify(require('child_process').exec),
	os = require('node:os'),
	hasha = require('hasha'),
	$C = require('collection.js');

const
	{WorkspaceController} = require('../core/workspaceController');

require('@v4fire/core');
require('dotenv').config();

class ResolveYarnDependencies extends WorkspaceController {
	/**
	 * Path to temporary save the list of the missing dependencies
	 */
	missingDependenciesFilePath = this.vfs.resolve('tmp/missing-dependencies.json');

	/**
	 * Options for command execution
	 */
	stdoutOptions = {maxBuffer: 1024 * 100000};

	/**
	 * Main registry of npm
	 */
	mainRegistry = 'https://registry.npmjs.org';

	/**
	 * Private npm registry mirror, set by user
	 */
	userRegistry = process.env.V4_REGISTRY;

	/**
	 * Path to the project lock file
	 */
	lockFilePath = this.vfs.resolve('yarn.lock');

	/**
	 * Path to the project `package.json` file
	 */
	packageJSONPath = this.vfs.resolve('package.json');

	/**
	 * Fetch dependencies versions from the private npm registry
	 * and compares it with the installed dependencies from the external registry
	 * If some dependencies is not exists in the private registry
	 * creates `resolutions` field for fixing it in package.json
	 * @returns {Promise<void>}
	 */
	async run() {
		if (!this.userRegistry) {
			throw new Error('User Registry is not provided! Please use env variable V4_REGISTRY or .env file');
		}

		try {
			await this.setRegistry(this.userRegistry);

			const
				missingDependencies = await this.getMissingDependencies(),
				resolutions = await this.formatResolutions(missingDependencies);

			await this.setResolutionsToPackageJSON(resolutions);

			await this.installDependencies();

		} finally {
			await this.setRegistry(this.mainRegistry);
		}
	}

	/**
	 * Set resolutions field in package.json
	 * @param {Object} resolutions
	 *
	 * @returns {Promise<void>}
	 */
	async setResolutionsToPackageJSON(resolutions) {
		const packageJSON = await this.getRootPackageJSON();
		packageJSON.resolutions = resolutions;

		await this.writeRootPackageJSON(packageJSON);
	}

	/**
	 * Set active registry of npm
	 * @param {string} registry
	 *
	 * @returns {Promise<void>}
	 */
	async setRegistry(registry) {
		await exec(`npm config set registry ${registry}`);
	}

	/**
	 * Installs all project dependencies
	 * @returns {Promise<void>}
	 */
	async installDependencies() {
		this.log.msg('Installing dependencies...');
		await exec('npm i', {stdio: 'inherit'});
	}

	/**
	 * Try to get all missing dependencies while comparing
	 * installed dependencies with the available versions in the private registry
	 * @returns {Promise<Object>}
	 */
	async getMissingDependencies() {
		if (await this.isMissingDependenciesActual()) {
			this.log.msg('Extract missing dependencies from cache...');

			const cache = this.getCachedDependencies();
			return cache.missingDependencies;
		}

		this.log.msg('Cache is not valid, check all installed dependencies...');

		const
			checkedDependencies = {},
			missingDependencies = [],
			deps = await this.getDependenciesOfProject(),
			depsSources = await this.getDependenciesSources();

		await $C(deps).forEach(async (dep) => {
			const
				{name, version} = dep,
				hashKey = `${dep.name}@${dep.version}`,
				isDependencyGit = depsSources[dep.name] !== 'npm';

			if (!checkedDependencies[hashKey] && !isDependencyGit) {
				checkedDependencies[hashKey] = true;

				const versionsList = await this.getPackageVersions(name);

				if (versionsList.length && !versionsList.includes(version)) {
					this.log.msg(`Package ${name} of ${version} is not exists in ${this.userRegistry}`);

					missingDependencies.push(this.formatMissingDependency(dep, versionsList));
				}
			}

		}, {parallel: os.cpus().length - 1});

		await this.saveMissingDependencies(missingDependencies);

		return missingDependencies;
	}

	/**
	 * Check the relevance of the local cache
	 * @returns {Promise<Boolean>}
	 */
	async isMissingDependenciesActual() {
		const
			cachedDependencies = await this.getCachedDependencies();

		if (cachedDependencies) {
			const
				lockFileHash = await this.getLockFileHash();

			return cachedDependencies.hash === lockFileHash;
		}

		return false;
	}

	/**
	 * Get list of all project dependencies in flat list
	 * @returns {Promise<Object>}
	 */
	async getDependenciesOfProject() {
		const {stdout} = await exec('npm query "*"', this.stdoutOptions);

		return JSON.parse(stdout);
	}

	async getDependenciesSources() {
		const
			{stdout} = await exec('yarn info --all --recursive --json', this.stdoutOptions),
			validSources = ['npm', 'https'];

		return stdout
			.split('\n')
			.reduce((acc, item) => {
				if (!item) {
					return acc;
				}

				const
					dependency = JSON.parse(item),
					[dependencyNameWithSource] = dependency.value.split(':'),
					// eslint-disable-next-line no-unused-vars
					[_, name, source] = dependencyNameWithSource.match(/(.+)@(.+)/);

				if (validSources.includes(source)) {
					acc[name] = source;
				}

				return acc;
			}, {});
	}

	/**
	 * Get list of missing dependencies from cache
	 * @returns {Promise<Object>}
	 */
	getCachedDependencies() {
		let cachedDependencies;

		try {
			cachedDependencies = JSON.parse(this.vfs.readFile(this.missingDependenciesFilePath, 'utf-8'));

		} catch { }

		return cachedDependencies;
	}

	/**
	 * Returns contenthash of lock file
	 * @return {Promise<String>}
	 */
	getLockFileHash() {
		return hasha.fromFile(this.lockFilePath);
	}

	/**
	 * Saves list of missing in private registry dependencies
	 * @param {Array<Object>} missingDependencies
	 * @returns {Promise<void>}
	 */
	async saveMissingDependencies(missingDependencies) {
		const hashOfLockFile = await this.getLockFileHash();

		this.vfs.writeFile(this.missingDependenciesFilePath, JSON.stringify({
			hash: hashOfLockFile,
			missingDependencies
		}, null, 2));
	}

	/**
	 * Formats missing dependecy record
	 * @param {Object} dependency
	 * @param {Array<String>} versionsList
	 * @returns {Object}
	 */
	formatMissingDependency(dependency, versionsList) {
		return {
			name: dependency.name,
			requestedVersion: dependency.version,
			version: this.findNearsetVersion(versionsList, dependency.version),
			originalInfo: dependency
		};
	}

	/**
	 * Returns all dependency versions presented in registry
	 * @param {string} packageName
	 * @returns {Array<string>}
	 */
	async getPackageVersions(packageName) {
		const {stdout} = await exec(`yarn info --json ${packageName} versions`);

		try {
			return JSON.parse(stdout).data;

		} catch (err) {
			this.log.error(`Something went wrong while getting package versions of ${packageName}\n`, err);
			return [];
		}
	}

	/**
	 * Find nearest major version of the dependency in presented list
	 *
	 * @param {Array<String>} availableVersions
	 * @param {String} version
	 * @returns {String}
	 */
	findNearsetVersion(availableVersions, version) {
		const majorVersion = this.getMajorFromVersion(version);

		return availableVersions.filter((version) => version.split('.')[0] === majorVersion).at(-1);
	}

	/**
	 * Returns number of major version from full semver
	 * 2.5.0 => 2
	 * ^3.9.1 => 3
	 * @param {String} version
	 * @returns {Strgin}
	 */
	getMajorFromVersion(version) {
		return version.replace('^', '').split('.')[0];
	}

	/**
	 * Format missing dependencies in format of `resolutions` field in package.json
	 * for proper resolution of dependencies while installs from private registry
	 * @param missingDependencies
	 * @returns {Promise<Object>}
	 */
	formatResolutions(missingDependencies) {
		return missingDependencies.reduce((acc, dependency) => {
			acc[dependency.name] = dependency.version;

			return acc;
		}, {});
	}
}

module.exports = ResolveYarnDependencies;
