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
	parse = require('parse-git-config');

/**
 * Current user name
 */
exports.gitUser = (() => {
	const gc = gitconfig({type: 'global'});
	const options = {cwd: '/', path: gc};

	const config = parse.sync(options) || {},
		defaultUser = {
			name: 'John',
			email: 'john@doe.com'
		};

	if (!config.user) {
		return defaultUser;
	}

	return {
		name: config.user.user || config.user.name || defaultUser.name,
		email: config.user.name || config.user.email || defaultUser.email
	};
})();
