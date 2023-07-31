const fs = require('fs');
const Handlebars = require('handlebars');
const {Controller} = require('../core/controller');
const {getOutputFileInfo} = require('../core/handlebars');
const path = require('path');

class TestController extends Controller {
	/** @override */
	async run() {
		const
			name = this.resolveName(this.config.name, this.prefix);

		const
			destination = this.vfs.resolve(this.config.path),
      templateSource = path.resolve('src/templates/component/default');

		// this.copyTemplate(templateSource, destination, name);
	}

	async copyTemplate(targetPath, destPath, tempName) {
		const
			tempExt = this.vfs.extname(targetPath.split(path.sep).at(-1));

		if (tempExt !== '.handlebars') {
			this.vfs.ensureDir(destPath);
			fs.copyFileSync(targetPath, destPath);
			return;
		}

		const
      {name, ext} = await getOutputFileInfo(targetPath);

		let
			fileName = `${name}.${ext}`;

		if (name === '[[name]]' || name == null) {
			fileName = `${tempName}.${ext}`;
		}

    console.log(fileName, tempName);

		// const
		// 	dPath = this.vfs.resolve(destPath, fileName),
		// 	raw = this.vfs.readFile(templatePath, 'utf-8'),
		// 	data = Handlebars.template(raw)({name: tempName});

		// this.vfs.writeFile(dPath, data);
	}

	copyDir(source, destination, options) {
		return copy(source, destination, options);

		async function copy(source, destination, options = {}, pathStack = []) {
			const
				{onDataWrite, afterEachCopy, withFolders = true} = options;

			const
				curPath = this.resolve(source, ...pathStack),
				isDirectory = this.isDirectory(curPath);

			if (!isDirectory) {
				const
					fileData = this.readFile(curPath),
					destPath = this.resolve(destination, ...pathStack);

				await this.ensureDir(this.resolve(destination, ...pathStack.slice(0, pathStack.length - 1)));

				this.writeFile(destPath, typeof onDataWrite === 'function' ? onDataWrite(fileData) : undefined);

				if (typeof afterEachCopy === 'function') {
					afterEachCopy(destPath);
				}

				return;
			}

			const
				dir = this.readdir(curPath);

			for (const file of dir) {
				if (!withFolders && this.isDirectory(this.resolve(curPath, file))) {
					continue;
				}

				await this.copy(source, destination, options, [...pathStack, file]);
			}
		}
	}
}

module.exports = TestController;
