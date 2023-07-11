const {Controller} = require('../core/controller');

class MakeController extends Controller {
	async run() {
		const
			prefix = this.config.subject === 'block' ? 'b' : 'p',
			name = this.resolveName(this.config.name, prefix);

		const
			source = this.vfs.resolve(__dirname, '../templates/component'),
			destination = this.vfs.resolve(this.config.path, name);

		await this.vfs.ensureDir(destination);
		this.copyFolder(source, destination, name);
	}
}

module.exports = MakeController;
