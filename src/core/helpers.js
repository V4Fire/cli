/**
 * Camelize string
 * @param {string} str
 */
exports.camelize = (str) =>
	str.replace(/[_-]([a-z])/g, (_, char) => char.toUpperCase());

/**
 * Uppercase first char
 * @param {string} str
 */
exports.ucfirst = (str) => str[0].toUpperCase() + str.substr(1);

const gitconfig = require('git-config-path'),
	parse = require('parse-git-config'),
	extend = require('extend-shallow');

/**
 * Current user name
 */
exports.gitUserName = ((options) => {
	const gc = gitconfig(extend({type: 'global'}, options && options.gitconfig));
	options = extend({cwd: '/', path: gc}, options);
	const config = parse.sync(options) || {};
	return config.user ? config.user.user || config.user.name : null;
})({});
