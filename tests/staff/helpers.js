const {Application} = require('../../src/application');
const {VirtualFileSystem} = require('../../src/core/vfs');

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

/**
 * @returns {VirtualFileSystem}
 */
function getVFS() {
	return new VirtualFileSystem();
}

module.exports = {getApplication, getVFS};
