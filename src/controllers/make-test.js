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

		if (destination.split(path.sep).length < 0) {
			const
				chunk = this.config.subject === 'page' ? 'pages' : 'components';

			destination = this.vfs.findInDir(this.vfs.resolve('src', chunk), this.config.target);
		}

		this.vfs.ensureDir(destination, 'test');
		destination = this.vfs.resolve(destination, 'test');

		await this.copyTestFolder(source, destination);
	}

	/**
	 * Copies test folder from source to destination with replacing component/module names
	 *
	 * @param {string} source
	 * @param {string} destination
	 *
	 * @returns {Promise<void>}
	 */
	copyTestFolder(source, destination) {
		this.vfs.ensureDir(destination);

		const
			prefix = this.config.subject === 'page' ? 'p-' : 'b-',
			name = destination.split(path.sep).at(-2).replace(RegExp(prefix), '');

		const
			sourcePath = this.vfs.resolve(source),
			destinationPath = this.vfs.resolve(destination);

		this.vfs.copyDir(
			sourcePath,
			destinationPath,
			(data) => this.replaceNames(
				data,
				[`${prefix}name`, `${prefix}${name}`],
				['r-name', name]
			)
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
		console.log('def', defName, newName);
		console.log('clear', clearName, newClearName);

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
