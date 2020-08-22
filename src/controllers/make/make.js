const { Controller } = require("../../core/controller");
const fs = require('fs-extra');
const path = require('path');
const { camelize } = require("../../core/helpers");

class MakeController extends Controller {
	async run() {
		const
			prefix = this.config.subject === 'block' ? 'b' : 'p',
			name = this.resolveName(this.config.name, prefix);

		const
			source = path.resolve(__dirname, 'template', this.config.subject),
			destination = path.resolve(this.config.path, name),
			defName = prefix + '-name';

		await fs.ensureDir(destination);

		const files = fs.readdirSync(source);

		for (const file of files) {
			const
				data = fs.readFileSync(path.resolve(source, file), 'utf8'),
				newFile = path.resolve(destination, file.replace(defName, name));

			if (!fs.existsSync(newFile) || this.config.override) {
				fs.writeFileSync(
					newFile,
					data
						.replace(defName, name)
						.replace(RegExp(camelize(defName), 'i'), camelize(name))
				);
			}
		}
	}
}

module.exports = MakeController;
