class MakeController extends Controller {
	resolvedName;

	/** @override */
	async run() {
		const
			name = this.resolveName(this.config.name, this.prefix),
			source = this.vfs.resolve(__dirname, '../templates/component'),
			secondarySource = this.vfs.resolve(__dirname, '../templates/component', this.config.template),
			destination = this.vfs.resolve(this.config.path, name);

		this.handlebarsOptions = {name, clearName: this.config.name};

		await this.vfs.ensureDir(secondarySource);
		await this.vfs.ensureDir(destination);

		await this.copyDir(source, destination, {withFolders: false});
		await this.copyDir(secondarySource, destination, {withFolders: true});
	}
}

module.exports = MakeController;
