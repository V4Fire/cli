const colors = require('chalk');

class Logger {
	reporter;

	constructor(reporter) {
		this.reporter = reporter;
	}

	/**
	 * Console text with some color
	 *
	 * @param text
	 * @param color
	 * @private
	 */
	log(text, color = colors.grey) {
		if (this.reporter === 'raw') {
			console.log(color(text));
		}
	}

	/**
	 * Console error
	 * @param text
	 */
	error(text) {
		this.log(text, colors.redBright);
	}

	/**
	 * Console some information
	 * @param text
	 */
	info(text) {
		this.log(text, colors.blue);
	}

	/**
	 * Console some text
	 * @param text
	 */
	msg(text) {
		this.log(text, colors.gray);
	}
}

module.exports.Logger = Logger;
