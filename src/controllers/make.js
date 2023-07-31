require('../core/handlebars');

const readline = require('readline');
const fs = require('fs');
const {Controller} = require('../core/controller');
const Handlebars = require('handlebars');
const path = require('path');

class MakeController extends Controller {
	resolvedName;

	/** @override */
	async run() {
		this.resolvedName = this.resolveName(this.config.name, this.prefix);

		const
			baseSource = this.vfs.resolve(__dirname, '../templates/component'),
			templateFolderSource = this.vfs.resolve(baseSource, this.config.template);

		this.copyDir(templateFolderSource, this.config.path, {name: this.config.name});
	}

	copyDir(source, destination, options) {
		const copy = async (source, destination, options = {}, pathStack = []) => {
			const
				{onDataWrite, withFolders = true} = options;

			const
				curPath = this.vfs.resolve(source, ...pathStack),
				isDirectory = this.vfs.isDirectory(curPath);

			if (!isDirectory) {
				const
					destDirPath = this.vfs.resolve(destination, ...pathStack.slice(0, pathStack.length - 1)),
					fileExt = this.vfs.extname(pathStack.at(-1));

				await this.vfs.ensureDir(this.vfs.resolve(destination, ...pathStack.slice(0, pathStack.length - 1)));

				if (fileExt.includes('handlebars')) {
					let
						{name, ext} = await this.getOutputFileInfo(curPath),
						p = this.vfs.resolve(destination, ...pathStack);

					console.log(pathStack);

					if (name === '[[name]]' || name == null) {
						name = options.name;
						const foo = p
							.split(path.sep)
							.slice(0, p.split(path.sep).length - 1);

						foo.push(`${name}.${ext}`);
						p = foo.join(path.sep);
					}

					console.log(curPath, p, {name});
					// await this.writeTemplate(curPath, p, {name});

					return;
				}

				this.vfs.writeFile(
					this.vfs.resolve(destination, ...pathStack),
					this.vfs.readFile(curPath)
				);

				return;
			}

			const
				dir = this.vfs.readdir(curPath);

			for (const file of dir) {
				if (!withFolders && this.vfs.isDirectory(this.vfs.resolve(curPath, file))) {
					continue;
				}

				await copy(source, destination, options, [...pathStack, file]);
			}
		};

		return copy(source, destination, options);
	}

	getOutputFileInfo(path) {
		const rl = readline.createInterface({
			input: fs.createReadStream(path)
		});

		let
			resolve,
			reject;

		const res = new Promise((res, rej) => {
			resolve = res;
			reject = rej;
		});

		rl.once('line', (line) => {
			try {
				const
					{name} = /^{{!.*(name=(?<name>[A-Za-z[\].\-_]+?)[^A-Za-z[\].\-_].*}}$)/g.exec(line).groups,
					{ext} = /^{{!.*(extension|ext=(?<ext>[A-Za-z.]+?)[^A-Za-z.].*}}$)/g.exec(line).groups;

				resolve({name, ext});

			} catch (error) {
				reject(error);
			}
		});

		return res;
	}

	async writeTemplate(source, destination, options) {
		await this.vfs.ensureDir(destination);

		this.vfs.writeFile(
			destination,
			Handlebars.compile(this.vfs.readFile(source))(options)
		);
	}
}

module.exports = MakeController;
