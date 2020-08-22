/**
 * JSON reporter
 * @param {object} data
 * @this ../Application
 */
function json(data) {
	let result = {
		status: false,
		data: {}
	};

	if (data instanceof Error) {
		result.data.message = data.message;
		result.data.code = data.code;

		if (this.config.debug) {
			result.data.stack = data.stack;
		}
	} else {
		result.status = true;
		result.data = data;
	}

	if (!this.config.debug) {
		console.clear();
		console.log(JSON.stringify(result));
	} else {
		console.log(JSON.stringify(result, null, ' '));
	}

	process.exit();
}

module.exports.json = json;
