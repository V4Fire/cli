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

	/**
	 * Default name of component for module testing
	 * @type {string}
	 */
	defaultComponentName = 'b-dummy';

	async run() {
		this.updateCases(this.config.runners);
		this.updateDemoPageDeps();

		const source = this.vfs.resolve(
			__dirname,
			'..',
			'templates',
			'test',
			this.component === this.moduleOrComponentName ? 'component' : 'module',
			this.config.runners.length === 0 ? 'simple' : 'with-runners'
		);

		const destination = this.vfs.resolve(this.config.path, 'test');

		await this.copyTestFolder(source, destination);
	}

	/**
	 * Name of component tests being generated for
	 * @returns {string}
	 */
	get component() {
		const dirName = this.config.path.split(path.sep).pop();

		if (/^b-/.test(dirName)) {
			return dirName;
		}

		return this.defaultComponentName;
	}

	/**
	 * Name of component or module for generating tests
	 * @returns {string}
	 */
	get moduleOrComponentName() {
		if (this.component !== this.defaultComponentName) {
			return this.component;
		}

		return this.config.path.split(path.sep).pop();
	}

	/**
	 * Copies test folder from source to destination with replacing component/module names
	 *
	 * @param source
	 * @param destination
	 *
	 * @returns {Promise<void>}
	 */
	async copyTestFolder(source, destination) {
		await this.vfs.ensureDir(destination);

		const defName =
			this.moduleOrComponentName === this.component ? 'b-name' : 'name';

		const indexFileSource = this.vfs.resolve(source, 'index.js'),
			indexFileDestination = this.vfs.resolve(destination, 'index.js'),
			indexFileData = this.vfs.readFile(indexFileSource);

		this.vfs.writeFile(
			indexFileDestination,
			this.replaceNames(indexFileData, this.moduleOrComponentName, defName)
		);

		const {runners} = this.config;

		if (runners.length === 0) {
			return;
		}

		const runnersSource = this.vfs.resolve(source, 'runners', 'runner.js'),
			runnersDestination = this.vfs.resolve(destination, 'runners'),
			runnerData = this.vfs.readFile(runnersSource);

		await this.vfs.ensureDir(runnersDestination);

		runners.forEach((runner) => {
			const runnerFileDestination = this.vfs.resolve(
				runnersDestination,
				`${runner}.js`
			);

			this.vfs.writeFile(
				runnerFileDestination,
				this.replaceNames(
					runnerData,
					this.moduleOrComponentName,
					defName,
					runner
				)
			);

			this.log.msg(`File:${runnerFileDestination}`);
		});
	}

	/**
	 * Updates `cases.js` by adding new cases for generated tests
	 * @param {string[]} runners
	 */
	updateCases(runners) {
		const sourcePath = this.vfs.resolve('tests/cases.js');

		if (!this.vfs.exists(sourcePath)) {
			this.log.error(
				`File ${sourcePath} does not exist.\nCreate it and write a basic structure of it in order to generate cases.`
			);

			return;
		}

		const source = this.ast.createSourceFile(sourcePath);

		const commentString = `// ${this.moduleOrComponentName}`,
			testEntryPath = this.vfs.pathByRoot(
				this.vfs.resolve(this.config.path, 'test')
			);

		const caseStrings = [];

		if (runners.length === 0) {
			caseStrings.push(
				`\n\t'--test-entry ${this.vfs.removeTrailingSep(testEntryPath)}'`
			);
		} else {
			runners.forEach((runner) => {
				caseStrings.push(
					`\n\t'--test-entry ${this.vfs.removeTrailingSep(
						testEntryPath
					)} --runner ${runner}'`
				);
			});
		}

		const casesNodeObject = this.ast.findASTNodeObject(
				source,
				(node) => ts.SyntaxKind[node.kind] === 'ArrayLiteralExpression'
			),
			cases = casesNodeObject.elements,
			insertPosition = cases.end;

		const sourceFile = this.vfs.readFile(sourcePath);

		const newFile = `${sourceFile.slice(
			0,
			insertPosition
		)},\n\n\t${commentString}${caseStrings.join(',')}${sourceFile.slice(
			insertPosition
		)}`;

		this.vfs.writeFile(sourcePath, newFile);
	}

	/**
	 * Updates demo page dependencies with new component
	 */
	updateDemoPageDeps() {
		if (this.component === this.defaultComponentName) {
			return;
		}

		const pages = this.vfs.readdir(this.vfs.resolve('src/pages'));

		let page;

		for (let i = 0; i < pages.length; i++) {
			if (/p-.*-components-demo/.test(pages[i])) {
				page = pages[i];
				break;
			}
		}

		if (!page) {
			this.log.error(
				`Components-demo page does not exist at ${pages}.\nCreate it in order to add dependencies for tests.`
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
	}

	/**
	 * Replaces all occurrences of `defName` with `newName` with different typings
	 *
	 * @param {string} content
	 * @param {string} newName
	 * @param {string} defName
	 * @param {string | undefined} runner
	 *
	 * @returns {string}
	 */
	replaceNames(content, newName, defName = 'b-name', runner = undefined) {
		const result = content
			.replace(RegExp(defName, 'g'), newName)
			.replace(RegExp(camelize(defName), 'g'), camelize(newName))
			.replace(
				RegExp(ucfirst(camelize(defName)), 'g'),
				ucfirst(camelize(newName))
			);

		if (runner != null) {
			return result.replace(/runner/g, runner);
		}

		return result;
	}

	/** @override */
	constructor(config, vfs, log) {
		super(config, vfs, log);
		this.ast = new AbstractSyntaxTree(vfs);
	}
}

module.exports = MakeTestController;
