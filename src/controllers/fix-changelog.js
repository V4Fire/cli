const {Controller} = require('../core/controller');

class FixChangelogController extends Controller {
	// Storage of boilerplate from file
	boilerplate = '';

	// Divider of records in changelog;
	divider = '## (';

	run() {
		const files = [
			...this.vfs.getFilesByGlobPattern('!(node_modules)/**/CHANGELOG.md'),
			...this.vfs.getFilesByGlobPattern('CHANGELOG.md')
		].filter((el) => {
			const lines = this.vfs.readFile(el).split('\n');

			const isValidFile = lines.every((line) => {
				if (line.startsWith('## ')) {
					return Boolean(line.match(/##\s\(\d{4}-\d{2}-\d{2}\)/));
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
	 * @return {string}
	 */
	updateChangelogContent(text) {
		const actions = [
			this.clearConflicts,
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
	 * @return {string}
	 */
	saveBoilerplate(text) {
		const elements = text.split(this.divider);

		this.boilerplate = elements.splice(0, 1)[0];

		return `${this.divider}${elements.join(this.divider)}`;
	}

	/**
	 * Return boilerplate memory to text
	 *
	 * @param {string} text
	 *
	 * @return {string}
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
	 * @return {string}
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
	 * Sort records by dates
	 *
	 * @param {string} text
	 *
	 * @return {string}
	 */
	sortRecords(text) {
		const records = text.split(this.divider);

		// Last element should end with \n\n
		while (!records[records.length - 1].endsWith('\n\n')) {
			records[records.length - 1] = `${records[records.length - 1]}\n`;
		}

		records.sort((a, b) => new Date(b.slice(0, 10)) - new Date(a.slice(0, 10)));

		// Last element after sort should have only one \n
		records[records.length - 1] = records[records.length - 1].slice(
			0,
			records[records.length - 1].length - 1
		);

		return records.join(this.divider);
	}
}

module.exports = FixChangelogController;
