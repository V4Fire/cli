const path = require('path');
const {getOutputFileInfo, Handlebars} = require('./handlebars');
const {camelize, ucfirst, gitUser} = require('./helpers');

/**
 * @typedef { import("./interface").Config }
 */
class Controller {
	/**
	 * @type {IConfig}
	 */
	config;

	/**
	 * @type {VirtualFileSystem}
	 */
	vfs;

	/**
	 * @type {./log/Logger}
	 */
	log;

	/**
	 * @type {Dictionary}
	 */
	handlebarsOptions;

	/**
	 * Prefix for a current subject
	 *
	 * @returns {string}
	 */
	get prefix() {
		return this.config.subject === 'page' ? 'p' : 'b';
	}

	/**
	 * @param {IConfig} config
	 * @param {VirtualFileSystem} vfs
	 * @param {Logger} log
	 */
	constructor(config, vfs, log) {
		this.config = config;
		this.vfs = vfs;
		this.log = log;
	}

	/**
	 * @param {string} name
	 * @param {string} [prefix]
	 * @param {boolean} [withPrefix]
	 * @returns {string}
	 */
	resolveName(name, prefix = 'b', withPrefix = true) {
		let
			localName = name;

		if (name.split(path.sep).length <= 1) {
			localName = name.split(path.sep).at(-1);
		}

		if (withPrefix) {
			return /^[bp]-/.test(localName) ? localName : `${prefix}-${localName}`;
		}

		return localName;
	}

	/**
	 * Copies directory
	 *
	 * @param {string} source
	 * @param {string} destination
	 * @param {CopyDirOptions} options
	 * @returns {Promise<void>}
	 */
	copyDir(source, destination, options) {
		return this.copy(source, destination, options);
	}

	/**
	 * Rename all names to target name
	 *
	 * @param {string} content
	 * @param {string} newName
	 * @param {string} defName
	 * @param {false|string} defExtend
	 * @returns {string}
	 * @protected
	 */
	replaceNames(content, newName, defName = 'b-name', defExtend = 'i-block') {
		let result = content
			.replace(
				/base\//g,
				this.vfs.toPosixPath(this.vfs.pathByRoot(this.config.path))
			)
			.replace(/{Date}/g, new Date().toISOString().substr(0, 10))
			.replace(/@YourName/g, gitUser.name)
			.replace(/@YourFullName/g, `${gitUser.name}<${gitUser.email}>`)
			.replace(RegExp(defName, 'g'), newName)
			.replace(RegExp(camelize(defName), 'g'), camelize(newName))
			.replace(
				RegExp(ucfirst(camelize(defName)), 'g'),
				ucfirst(camelize(newName))
			);

		// Replace extend
		if (defExtend && this.config.subject !== 'app') {
			result = result
				.replace(RegExp(defExtend, 'g'), this.config.extend)
				.replace(
					RegExp(camelize(defExtend), 'g'),
					camelize(this.config.extend)
				);
		}

		return result;
	}

	/**
	 * Copies and resolves handlebars template
	 *
	 * @param {string} sourceFile
	 * @param {string} destinationFolder
	 * @returns {Promise<void>}
	 * @protected
	 */
	async copyTemplate(sourceFile, destinationFolder) {
		let
			{outputName, ext} = await getOutputFileInfo(sourceFile);

		if (outputName === '[[name]]' || outputName == null) {
			outputName = this.handlebarsOptions.name;
		}

		this.vfs.writeFile(
			`${destinationFolder}${path.sep}${outputName}.${ext}`,
			Handlebars.compile(this.vfs.readFile(sourceFile))(this.handlebarsOptions)
		);
	}

	/**
	 * Copies directory
	 *
	 * @param {string} source
	 * @param {string} destination
	 * @param {CopyDirOptions} options
	 * @param {string[]} pathStack
	 * @returns {Promise<void>}
	 * @protected
	 */
	async copy(source, destination, options = {}, pathStack = []) {
		const
			{withFolders = true} = options;

		const
			curSource = this.vfs.resolve(source, ...pathStack),
			isDirectory = this.vfs.isDirectory(curSource);

		if (isDirectory) {
			for (const file of this.vfs.readdir(curSource)) {
				if (!withFolders && this.vfs.isDirectory(this.vfs.resolve(curSource, file))) {
					continue;
				}

				await this.copy(source, destination, options, [...pathStack, file]);
			}

			return;
		}

		const
			curDestinationFolder = this.vfs.resolve(destination, ...pathStack.slice(0, pathStack.length - 1));

		await this.vfs.ensureDir(curDestinationFolder);

		if (this.vfs.extname(pathStack.at(-1)) === '.handlebars') {
			console.log('copyTemplate', curSource);
			await this.copyTemplate(curSource, curDestinationFolder);
			return;
		}

		console.log('copyFile', curSource);
		this.vfs.writeFile(
			this.vfs.resolve(destination, ...pathStack),
			this.vfs.readFile(curSource)
		);
	}
}

exports.Controller = Controller;
