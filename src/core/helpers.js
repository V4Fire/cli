/**
 *
 * @param {string} str
 */
exports.camelize = (str) => str.replace(/[_-]([a-z])/g, (_, char) => char.toUpperCase())
