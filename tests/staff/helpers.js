const {Application} = require('../../src/application');

/**
 * @param {IConfig} options
 * @returns {Application | Application}
 */
function getApplication(options) {
	return new Application({
		debug: true,
		reporter: 'silent',
		...options
	});
}

module.exports.getApplication = getApplication;
