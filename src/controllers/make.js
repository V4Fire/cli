const {Controller} = require('../core/controller');

class MakeController extends Controller {
	/** @override */
	async run() {
		const
			name = this.resolveName(this.config.name, this.prefix);

		const
			baseSource = this.vfs.resolve(__dirname, '../templates/component'),
			templateSource = this.vfs.resolve(baseSource, this.config.template),
			destination = this.vfs.resolve(this.config.path, name);

		const options = {
			onDataWrite: (data) => this.replaceNames(data, name),
			afterEachCopy: (fileName) => this.log.msg(`Create: ${fileName}`)
		};

		await this.vfs.ensureDir(destination);

		await Promise.allSettled([
			this.vfs.copyDir(baseSource, destination, {...options, withFolders: false}),
			this.vfs.copyDir(templateSource, destination, options)
		]);
	}
}

module.exports = MakeController;
