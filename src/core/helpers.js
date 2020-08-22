/**
 * Camelize string
 * @param {string} str
 */
exports.camelize = (str) => str.replace(/[_-]([a-z])/g, (_, char) => char.toUpperCase())

/**
 * Uppercase first char
 * @param {string} str
 */
exports.ucfirst = (str) => {
	return str[0].toUpperCase() + str.substr(1);
}




