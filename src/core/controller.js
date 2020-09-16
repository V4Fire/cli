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
	 * @returns {string}
	 */
	resolveName(name, prefix = 'b') {
		return /^[bp]-/.test(name) ? name : `${prefix}-${name}`;
	}

	/**
	 * Copy files and directories from source to destination
	 *
	 * @param {string} source
	 * @param {string} destination
	 * @param {string} name
	 * @param {boolean} withFolders
	 * @private
	 */
	copyFolder(source, destination, name, withFolders = false) {
		const files = this.vfs.readdir(source);

		for (const file of files) {
			const fileName = this.vfs.resolve(source, file);

			if (this.vfs.isDirectory(fileName)) {
				if (withFolders) {
					this.log.msg(`Directory:${fileName}`);
					this.vfs.ensureDir(this.vfs.resolve(destination, file));
					this.copyFolder(
						fileName,
						this.vfs.resolve(destination, file),
						name,
						true
					);
				} else if (file === this.config.template) {
					this.copyFolder(fileName, destination, name);
				}

				continue;
			}

			const data = this.vfs.readFile(fileName),
				newFile = this.vfs.resolve(destination, this.replaceNames(file, name));

			if (!this.vfs.exists(newFile) || this.config.override) {
				this.log.msg(`File:${newFile}`);
				this.vfs.writeFile(newFile, this.replaceNames(data, name));
			}
		}
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
}

exports.Controller = Controller;
