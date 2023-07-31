const path = require('path');
const {Controller} = require('../core/controller');

class CreateAppController extends Controller {
	/** @override */
	async run() {
		const
			source = this.vfs.resolve(__dirname, '../templates/app'),
			appName = this.config.name || 'v4fire-app',
			appPath = appName.split(path.sep);

		let
			destination = './';

		if (
			appPath.length > 1 ||
			(appPath.length <= 1 && (!this.vfs.exists(this.config.name) || !this.vfs.isDirectory(this.config.name)))
		) {
			this.vfs.resolve('./');

		} else {
			destination = this.vfs.resolve(...appPath);
		}

		this.handlebarsOptions = {name: appName};

		await this.vfs.ensureDir(destination);
		await this.copyDir(source, destination, {withFolders: true});
	}
}

module.exports = CreateAppController;
