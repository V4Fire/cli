/**
 * Silent reporter
 * @param {object} data
 * @this ../Application
 */
function silent(data) {
	if (data instanceof Error) {
		throw data;
	}
}

module.exports.silent = silent;
