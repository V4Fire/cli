const {Controller} = require('../core/controller');

class FixChangelogController extends Controller {
	// Storage of boilerplate from file
	boilerplate = '';

	run() {
		const files = [
			...this.vfs.getFilesByGlobPattern('!(node_modules)/**/CHANGELOG.md'),
			...this.vfs.getFilesByGlobPattern('CHANGELOG.md')
		].filter((el) => {
			const lines = this.vfs.readFile(el).split('\n');

			const isValidFile = lines.every((line) => {
				if (line.startWith('## ')) {
					return Boolean(line.match(/##\s\(\d{4}-\d{2}-\d{2}\)/));
				}

				return true;
			});

			if (!isValidFile) {
				this.log.error(
					`Skipping file "${el}". Reason: Some record don't match pattern '## (1970-01-01)'`
				);
			}

			return isValidFile;
		});

		files.forEach((file) => {
			this.log.msg(`Checking file "${file}"`);

			const fileContent = this.vfs.readFile(file);

			const actions = [
				this.saveBoilerplate,
				this.clearConflicts,
				this.sortRecords,
				this.returnBoilerplate
			];

			const newContent = actions.reduce((acc, el) => el(acc), fileContent);

			if (newContent !== fileContent) {
				this.log.info(`Updating file "${file}"`);
			}
		});
	}

	/**
	 * Remove boilerplate from text and save to memory
	 *
	 * @param {string} text
	 *
	 * @return {string}
	 */
	saveBoilerplate(text) {
		const elements = text.split('## (');

		this.boilerplate = elements.splice(0, 1)[0];

		return elements.join('## (');
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
				if (el.startsWith('=======')) {
					return '';
				}

				return el;
			})
			.join('\n');
	}

	/**
	 * Сортирует записи в changeloge по датам
	 *
	 * @param {string} text
	 *
	 * @return {string}
	 */
	sortRecords(text) {
		const records = text.split('## (');

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

		return records.join('## (');
	}
}

module.exports = FixChangelogController;
