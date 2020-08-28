/**
 * Raw reporter
 * @param {object} data
 * @this ../Application
 */
function raw(data) {
	if (data instanceof Error) {
		this.log.error(`Error: ${data.message}`);
	} else if (data.message) {
		this.log.info(`Result: ${data.message}`);
	}
}

module.exports.raw = raw;
