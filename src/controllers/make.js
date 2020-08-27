const {Controller} = require('../core/controller');
const {camelize, ucfirst} = require('../core/helpers');

class MakeController extends Controller {
	async run() {
		const prefix = this.config.subject === 'block' ? 'b' : 'p',
			name = this.resolveName(this.config.name, prefix);

		const source = this.vfs.resolve(__dirname, '../templates/component'),
			destination = this.vfs.resolve(this.config.path, name);

		await this.vfs.ensureDir(destination);
		this.copyFolder(source, destination, name);
	}

	/**
	 *
	 * @param {string} source
	 * @param {string} destination
	 * @param {string} name
	 * @private
	 */
	copyFolder(source, destination, name) {
		const files = this.vfs.readdir(source);

		for (const file of files) {
			const fileName = this.vfs.resolve(source, file);

			if (this.vfs.isDirectory(fileName)) {
				if (file === this.config.template) {
					this.copyFolder(fileName, destination, name);
				}

				continue;
			}

			const data = this.vfs.readFile(fileName),
				newFile = this.vfs.resolve(destination, this.replaceNames(file, name));

			if (!this.vfs.exists(newFile) || this.config.override) {
				this.vfs.writeFile(newFile, this.replaceNames(data, name));
			}
		}
	}

	/**
	 * Rename all names to target name
	 *
	 * @param {string} content
	 * @param {string} newName
	 * @returns {string}
	 * @private
	 */
	replaceNames(content, newName) {
		const defName = 'b-name';
		const defExtend = 'i-block';

		return content
			.replace(/base\//g, this.vfs.pathByRoot(this.config.path))
			.replace(/{Date}/g, new Date().toISOString().substr(0, 10))
			.replace(RegExp(defName, 'g'), newName)
			.replace(RegExp(defExtend, 'g'), this.config.extend)
			.replace(RegExp(camelize(defName), 'g'), camelize(newName))
			.replace(
				RegExp(ucfirst(camelize(defName)), 'g'),
				ucfirst(camelize(newName))
			)
			.replace(RegExp(camelize(defExtend), 'g'), camelize(this.config.extend));
	}
}

module.exports = MakeController;
