const { Controller } = require("../../core/controller");
const fs = require('fs-extra');
const path = require('path');
const { camelize } = require("../../core/helpers");

module.exports = class MakeController extends Controller {
	async run() {
		const
			prefix = this.config.subject === 'block' ? 'b' : 'p',
			name = this.resolveName(this.config.name, prefix);

		const
			source = path.resolve(__dirname, 'template', this.config.subject),
			destination = path.resolve(this.config.path, name);

		await fs.ensureDir(destination);

		const files = fs.readdirSync(source);

		for (const file of files) {
			const
				data = fs.readFileSync(path.resolve(source, file), 'utf8'),
				newFile = path.resolve(destination, file.replace('b-name', name));

			if (!fs.existsSync(newFile) || this.config.override) {
				fs.writeFileSync(
					newFile,
					data
						.replace('b-name', name)
						.replace('BName', camelize(name))
				);
			}
		}
	}
}
