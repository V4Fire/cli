const { Controller } = require("../../core/controller");
const fs = require('fs-extra');
const path = require('path');
const assert = require("assert");
const {camelize} = require("../../core/helpers");

module.exports = class RenameController extends Controller {
	async run() {
		const source = this.findSource();

		if (!source) {
			throw new Error('Source folder does not exist!');
		}

		assert(this.config.newName);

		const
			baseName = path.basename(source),
			newName = this.resolveName(this.config.newName, /^b-/.test(baseName) ? 'b' : 'p');

		const files = fs.readdirSync(source);

		for (const file of files) {
			const
				sourceFile = path.resolve(source, file),
				ext = path.extname(sourceFile),
				fileName = path.basename(sourceFile, ext);

			const data = fs.readFileSync(sourceFile, 'utf8');

			const
				newFile = fileName === baseName ?
					path.resolve(source, newName + ext.toLowerCase()) :
					sourceFile;

			if (!fs.existsSync(newFile) || this.config.override || fileName === 'index') {
				fs.writeFileSync(
					newFile,
					data
						.replace(baseName, newName)
						.replace(camelize(baseName), camelize(newName))
				);
			}

			if (fileName !== 'index') {
				fs.unlinkSync(sourceFile);
			}
		}

		fs.rename(source, path.resolve(this.config.path, newName));
	}

	findSource() {
		for (const prefix of ['', 'b-', 'p-']) {
			const source = path.resolve(this.config.path, prefix + this.config.name);

			if (fs.existsSync(source)) {
				return source;
			}
		}

		return false;
	}
}
