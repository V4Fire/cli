const MakeController = require('./make');
const RenameController = require('./rename');
const MakeTestController = require('./make-test');
const MakeAppController = require('./make-app');
const FixChangelogController = require('./fix-changelog');

module.exports = {
	MakeAppController,
	MakeController,
	RenameController,
	MakeTestController,
	FixChangelogController
};
