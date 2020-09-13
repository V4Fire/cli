const ts = require('typescript');

class AbstractSyntaxTree {
	/**
	 * @type {VirtualFileSystem}
	 */
	vfs;

	/**
	 * Reads source file contents and return its AST
	 *
	 * @param {string} sourceFilePath
	 * @returns {ts.SourceFile}
	 */
	createSourceFile(sourceFilePath) {
		const file = this.vfs.readFile(sourceFilePath);

		return ts.createSourceFile(__filename, file, ts.ScriptTarget.Latest);
	}

	/**
	 * Finds node matching `filter` in AST of `source` file and returns it
	 *
	 * @param {ts.SourceFile} source
	 * @param {function} filter
	 *
	 * @returns {ts.Node | undefined}
	 */
	findASTNodeObject(source, filter) {
		const cb = (node) => {
			if (filter(node)) {
				return node;
			}

			const res = ts.forEachChild(node, cb);

			if (res) {
				return res;
			}
		};

		return ts.forEachChild(source, cb);
	}

	/**
	 * @param {VirtualFileSystem} vfs
	 */
	constructor(vfs) {
		this.vfs = vfs;
	}
}

exports.AbstractSyntaxTree = AbstractSyntaxTree;
