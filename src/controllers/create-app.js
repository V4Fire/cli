const path = require('path');
const {Controller} = require('../core/controller');

class CreateAppController extends Controller {
	/** @override */
	async run() {
		const
			source = this.vfs.resolve(__dirname, '../templates/app'),
			appName = this.config.target || 'v4fire-app',
			appPath = appName.split(path.sep),
			directoryExists = this.vfs.exists(this.config.target) && this.vfs.isDirectory(this.config.target);

		let
			destination = './';

		if (appPath.length <= 1 && !directoryExists) {
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
