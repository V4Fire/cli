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
}

module.exports = MakeController;
