const
	colors = require('chalk');

class Logger {
	/**
	 * Console text with some color
	 *
	 * @param text
	 * @param color
	 * @private
	 */
	log(text, color = colors.grey) {
		console.log(color(text));
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

expors.log = new Logger();
