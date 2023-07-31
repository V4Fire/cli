const path = require('path');
const ts = require('typescript');

const {Controller} = require('../core/controller');
const {AbstractSyntaxTree} = require('../core/ast');

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

		const
			name = this.resolveName(this.config.target, this.prefix),
			clearName = this.resolveName(this.config.target, this.prefix, false);

		let
			destination = this.config.target;

		if (destination.split(path.sep).length === 1) {
			const
				chunk = this.config.subject === 'page' ? 'pages' : 'components',
				globPattern = `${this.vfs.resolve('src', chunk)}/**/${name}`;

			destination = this.vfs.getFilesByGlobPattern(globPattern)[0];
		}

		this.handlebarsOptions = {name, clearName};

		destination = this.vfs.resolve(destination, 'test');
		await this.vfs.ensureDir(destination, 'test');

		await this.copyDir(source, destination, {withFolders: true});
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

	/** @override */
	constructor(config, vfs, log) {
		super(config, vfs, log);
		this.ast = new AbstractSyntaxTree(vfs);
	}
}

module.exports = MakeTestController;
