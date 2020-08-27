const assert = require('assert');
const {Controller} = require('../core/controller');
const {camelize} = require('../core/helpers');

class RenameController extends Controller {
	async run() {
		const source = this.findSource();

		if (!source) {
			throw new Error('Source folder does not exist!');
		}

		assert(this.config.newName);

		const baseName = this.vfs.basename(source),
			newName = this.resolveName(
				this.config.newName,
				/^b-/.test(baseName) ? 'b' : 'p'
			);

		const files = this.vfs.readdir(source);

		for (const file of files) {
			const sourceFile = this.vfs.resolve(source, file),
				ext = this.vfs.extname(sourceFile),
				fileName = this.vfs.basename(sourceFile);

			if (this.vfs.isDirectory(sourceFile)) {
				continue;
			}

			const data = this.vfs.readFile(sourceFile, 'utf8');

			const newFile =
				fileName === baseName
					? this.vfs.resolve(source, newName + ext.toLowerCase())
					: sourceFile;

			if (
				!this.vfs.exists(newFile) ||
				this.config.override ||
				fileName === 'index'
			) {
				this.vfs.writeFile(
					newFile,
					data
						.replace(baseName, newName)
						.replace(RegExp(camelize(baseName), 'i'), camelize(newName))
				);
			}

			if (fileName !== 'index') {
				this.vfs.unlink(sourceFile);
			}
		}

		await this.vfs.rename(source, this.vfs.resolve(this.config.path, newName));
	}

	findSource() {
		for (const prefix of ['', 'b-', 'p-']) {
			const source = this.vfs.resolve(
				this.config.path,
				prefix + this.config.name
			);

			if (this.vfs.exists(source)) {
				return source;
			}
		}

		return false;
	}
}

module.exports = RenameController;
