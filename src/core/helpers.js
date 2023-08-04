const fs = require('fs');
const readline = require('readline');
const gitconfig = require('git-config-path');
const parse = require('parse-git-config');

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

/**
 * Read the first line from the file
 * @param {string} path
 */
exports.readFirstLine = (path) => {
  const rl = readline.createInterface({
    input: fs.createReadStream(path)
  });

  let
    resolve,
    reject;

	const res = new Promise((res, rej) => {
		resolve = res;
		reject = rej;
	});

	try {
		rl.once('line', (line) => resolve(line));

	} catch (error) {
		reject(error);
	}

	return res;
};
