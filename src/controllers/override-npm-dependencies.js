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

class UpNpmDependencies extends WorkspaceController {
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
	lockFilePath = this.vfs.resolve('package-lock.json');

	/**
	 * Path to the project `package.json` file
	 */
	packageJSONPath = this.vfs.resolve('package.json');

	/**
	 * Fetch dependencies versions from the private npm registry
	 * and compares it with the installed dependencies from the external registry
	 * If some dependencies is not exists in the private registry
	 * creates `overrides` field for fixing it in package.json
	 * @returns {Promise<void>}
	 */
	async run() {
		if (!this.userRegistry) {
			throw new Error('User Registry is not provided! Please use env variable V4_REGISTRY or .env file');
		}

		await this.setRegistry(this.userRegistry);

		const
			missingDependencies = await this.getMissingDependencies(),
			overrides = await this.formatOverrides(missingDependencies);

		await this.setOverrideToPackageJSON(overrides);

		await this.setRegistry(this.mainRegistry);
		await this.installDependencies();
	}

	/**
	 * Set overrides field in package.json
	 * @param {Object} overrides
	 *
	 * @returns {Promise<void>}
	 */
	async setOverrideToPackageJSON(overrides) {
		const packageJSON = await this.getRootPackageJSON();
		packageJSON.overrides = overrides;

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
			deps = await this.getDependenciesOfProject();

		await $C(deps).forEach(async (dep) => {
			const
				{name, version} = dep,
				hashKey = `${dep.name}@${dep.version}`;

			if (!checkedDependencies[hashKey] && !this.isDependencyGit(dep)) {
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

	// TODO add memo
	/**
	 * Get list of missed dependencies from cache
	 * @returns {Promise<Object>}
	 */
	getCachedDependencies() {
		let cachedDependencies;

		try {
			cachedDependencies = JSON.parse(this.vfs.readFile(this.missingDependenciesFilePath, 'utf-8'));

		} catch {}

		return cachedDependencies;
	}

	/**
	 * Returns contenthash of lock file
	 * @return {Promise<String>}
	 */
	getLockFileHash() {
		return hasha.fromFile('./package-lock.json');
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
			missedDependencies: missingDependencies
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
			const packageVersions = JSON.parse(stdout).data;
			return packageVersions;

		} catch (err) {
			this.log.error(`Something went wrong while getting package versions of ${packageName}\n`, err);
			return [];
		}
	}

	/**
	 * Checks is dependency installed from git
	 * @param dependency
	 * @returns {Boolean}
	 */
	isDependencyGit(dependency) {
		if (dependency.resolved != null) {
			return dependency.resolved.includes('git@git');
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
	 * Returns overrides field in appropriate format
	 * @see https://docs.npmjs.com/cli/v9/configuring-npm/package-json#overrides
	 *
	 * @param {String} name
	 * @param {String} version
	 * @returns {Object}
	 */
	async getOverrides(name, version) {
		const
			{stdout} = await exec(`npm explain --json ${name}@${this.getMajorFromVersion(version)}`, this.stdoutOptions),
			parentsTree = JSON.parse(stdout),
			overrides = {};

		parentsTree.forEach((parentTree) => {
			const isEveryParentSameMajorVersion = parentTree.dependents.every(
				(parent) => this.getMajorFromVersion(parent.spec) === this.getMajorFromVersion(version)
			);

			if (isEveryParentSameMajorVersion) {
				overrides[name] = version;

			} else {
				const parentsWithSameMajorVersion = parentTree.dependents.filter(
					(parent) => this.getMajorFromVersion(parent.spec) === this.getMajorFromVersion(version)
				);

				parentsWithSameMajorVersion.forEach((parent) => {
					const key = `${parent.from.name}@${parent.from.version}`;

					overrides[key] = {
						[name]: version
					};
				});
			}
		});

		return overrides;
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
	 * Format missing dependencies in format of `overrides` field in package.json
	 * for proper resolution of dependencies while installs from private registry
	 * @param missingDependencies
	 * @returns {Promise<Object>}
	 */
	formatOverrides(missingDependencies) {
		return missingDependencies.reduce(async (acc, dependency) => {
			const overridesAcc = await acc;

			if (dependency.name.startsWith('@types')) {
				overridesAcc[dependency.name] = dependency.version;
				return overridesAcc;
			}

			const overrides = await this.getOverrides(dependency.name, dependency.version);

			return Object.assign(overridesAcc, overrides);
		}, Promise.resolve({}));
	}
}

module.exports = UpNpmDependencies;
