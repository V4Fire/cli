const path = require('path');
const ts = require('typescript');

const {Controller} = require('../core/controller');
const {AbstractSyntaxTree} = require('../core/ast');
const {camelize, ucfirst} = require('../core/helpers');

class MakeTestController extends Controller {
	/**
	 * @type {AbstractSyntaxTree}
	 */
	ast;

	/** @override */
	async run() {
		this.updateDemoPageDeps();

		const source = this.vfs.resolve(
			__dirname,
			'..',
			'templates',
			'test',
			this.config.subject
		);

		let
			destination = this.vfs.resolve(this.config.target);

		if (this.config.target.split(path.sep).length === 1) {
			const
				chunk = this.config.subject === 'page' ? 'pages' : 'components',
				name = this.resolveName(this.config.target, this.prefix);

			destination = this.vfs.findInDir(this.vfs.resolve('src', chunk), name);
		}

		await this.vfs.ensureDir(destination, 'test');
		destination = this.vfs.resolve(destination, 'test');

		await this.copyTestFolder(source, destination);
	}

	/**
	 * Copies tests files from the source to the destination and fills templates
	 *
	 * @param {string} source
	 * @param {string} destination
	 *
	 * @returns {Promise<void>}
	 */
	async copyTestFolder(source, destination) {
		await this.vfs.ensureDir(destination);

		const
			clearName = destination.split(path.sep).at(-2).replace(RegExp(`${this.prefix}-`), '');

		const
			sourcePath = this.vfs.resolve(source),
			destinationPath = this.vfs.resolve(destination);

		await this.vfs.copyDir(
			sourcePath,
			destinationPath,
			{
				onDataWrite: (data) => this.replaceNames(
					data,
					[`${this.prefix}-name`, `${this.prefix}-${clearName}`],
					['r-name', clearName]
				),
				afterEachCopy: (path) => this.log.msg(`Create: ${path}`)
			}
		);
	}

	/**
	 * Updates demo page dependencies with new component
	 */
	updateDemoPageDeps() {
		if (this.component === this.defaultComponentName) {
			return;
		}

		const pagesDirPath = this.vfs.resolve('src/pages');

		if (!this.vfs.exists(pagesDirPath)) {
			this.log.error(
				`Components-demo page does not exist at ${pagesDirPath}.\nCreate it in order to add dependencies for tests.`
			);

			return;
		}

		const pages = this.vfs.readdir(pagesDirPath);

		let page;

		for (let i = 0; i < pages.length; i++) {
			if (/p-.*-components-demo/.test(pages[i])) {
				page = pages[i];
				break;
			}
		}

		if (!page) {
			this.log.error(
				`Components-demo page does not exist at ${pagesDirPath}.\nCreate it in order to add dependencies for tests.`
			);

			return;
		}

		const sourcePath = this.vfs.resolve(`src/pages/${page}/index.js`),
			source = this.ast.createSourceFile(sourcePath);

		const depsNodeObject = this.ast.findASTNodeObject(
				source,
				(node) => node.expression?.name?.escapedText === 'dependencies'
			),
			deps = depsNodeObject?.arguments;

		let lastStringDep;

		for (let i = deps.length - 1; i >= 0; i--) {
			if (ts.isStringLiteral(deps[i])) {
				lastStringDep = deps[i];
				break;
			}
		}

		if (!lastStringDep) {
			lastStringDep = deps[deps.length - 1];
		}

		const sourceFile = this.vfs.readFile(sourcePath);

		const insertPosition = lastStringDep.end,
			needNewLine =
				/\r|\n|\r\n/.test(sourceFile[insertPosition]) ||
				/\r|\n|\r\n/.test(sourceFile[insertPosition + 1]);

		const newFile = `${sourceFile.slice(0, insertPosition)},${
			needNewLine ? '\n\t\t' : ' '
		}'${this.component}'${sourceFile.slice(insertPosition)}`;

		this.vfs.writeFile(sourcePath, newFile);
		this.log.msg(`Update file: ${sourcePath}`);
	}

	/**
	 * Replaces all occurrences of `defName` and `clearName` with `newName` and `clearNewName` with different typings
	 *
	 * @param {string} content
	 * @param {[string, string]} defNameOptions
	 * @param {[string, string]} clearNameOptions
	 *
	 * @returns {string}
	 */
	replaceNames(
		content,
		[defName, newName],
		[clearName, newClearName]
	) {
		return content
			.replace(
				RegExp(`${defName}|${clearName}`, 'g'),
				(target) => target === defName ? newName : newClearName
			)
			.replace(
				RegExp(`${camelize(defName)}|${camelize(clearName)}`, 'g'),
				(target) => target === camelize(defName) ? camelize(newName) : camelize(newClearName)
			)
			.replace(
				RegExp(`${ucfirst(camelize(defName))}|${ucfirst(camelize(clearName))}`, 'g'),
				(target) => target === ucfirst(camelize(defName)) ? ucfirst(camelize(newName)) : ucfirst(camelize(newClearName))
			);
	}

	/** @override */
	constructor(config, vfs, log) {
		super(config, vfs, log);
		this.ast = new AbstractSyntaxTree(vfs);
	}
}

module.exports = MakeTestController;
