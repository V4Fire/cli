const {Controller} = require('../core/controller');

class ResolveChangelogController extends Controller {
	/**
	 * Storage of boilerplate from file
	 * @type {string}
	 */
	boilerplate = '';

	/**
	 * Divider of records in changelog
	 * @type {string}
	 */
	divider = '## (';

	run() {
		const files = [
			...this.vfs.getFilesByGlobPattern('!(node_modules)/**/CHANGELOG.md'),
			...this.vfs.getFilesByGlobPattern('CHANGELOG.md')
		].filter((el) => {
			const lines = this.vfs.readFile(el).split('\n');

			const isValidFile = lines.every((line) => {
				if (line.startsWith('## ')) {
					return Boolean(line.match(/^##\s\(\d{4}-\d{2}-\d{2}\)/));
				}

				return true;
			});

			if (!isValidFile) {
				this.log.error(
					`Skipping file "${el}". Reason: Some record doesn't match pattern '## (yyyy-mm-dd)'`
				);
			}

			return isValidFile;
		});

		files.forEach((file) => {
			this.log.msg(`Checking file "${file}"`);

			const fileContent = this.vfs.readFile(file);

			const newContent = this.updateChangelogContent(fileContent);

			if (newContent !== fileContent) {
				this.log.info(`Updating file "${file}"`);
				this.vfs.writeFile(file, newContent);
			}
		});
	}

	/**
	 * Applies all the methods in the right order to changelog content
	 *
	 * @param {string} text
	 *
	 * @returns {string}
	 */
	updateChangelogContent(text) {
		const actions = [
			this.clearConflicts,
			this.normalizeEmptyLines,
			this.saveBoilerplate,
			this.sortRecords,
			this.returnBoilerplate
		];

		return actions.reduce((acc, el) => el.call(this, acc), text);
	}

	/**
	 * Remove boilerplate from text and save to memory
	 *
	 * @param {string} text
	 *
	 * @returns {string}
	 */
	saveBoilerplate(text) {
		const elements = text.split(this.divider);

		this.boilerplate = elements.splice(0, 1)[0];

		return `${this.divider}${elements.join(this.divider)}`;
	}

	/**
	 * Return boilerplate from memory to text
	 *
	 * @param {string} text
	 *
	 * @returns {string}
	 */
	returnBoilerplate(text) {
		const textWithBoilerplate = this.boilerplate + text;

		this.boilerplate = '';

		return textWithBoilerplate;
	}

	/**
	 * Removes all signs of conflicts from the text
	 *
	 * @param {string} text
	 *
	 * @returns {string}
	 */
	clearConflicts(text) {
		return text
			.split('\n')
			.filter((el) => !(el.startsWith('<<<<<<<') || el.startsWith('>>>>>>>')))
			.map((el) => {
				if (el === '=======') {
					return '';
				}

				return el;
			})
			.join('\n');
	}

	/**
	 * Replaces all lines consisting only of spaces with empty line
	 *
	 * @param {string} text
	 *
	 * @returns {string}
	 */
	normalizeEmptyLines(text) {
		return text
			.split('\n')
			.map((line) => {
				if (line.match(/^\s+$/)) {
					return '';
				}

				return line;
			})
			.join('\n');
	}

	/**
	 * Sort records by dates
	 *
	 * @param {string} text
	 *
	 * @returns {string}
	 */
	sortRecords(text) {
		let records = text.split(this.divider).map((el, index) => {
			let elementWithNewLines = el;

			if (index !== 0) {
				while (!elementWithNewLines.endsWith('\n\n')) {
					elementWithNewLines += '\n';
				}
			}

			return elementWithNewLines;
		});

		records.sort((a, b) => new Date(b.slice(0, 10)) - new Date(a.slice(0, 10)));

		records = [...new Set(records)];

		// Last element after sort should have only one \n
		records[records.length - 1] = records[records.length - 1].slice(
			0,
			records[records.length - 1].length - 1
		);

		return records.join(this.divider);
	}
}

module.exports = ResolveChangelogController;
