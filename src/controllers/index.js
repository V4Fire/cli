const MakeController = require('./make');
const RenameController = require('./rename');
const MakeTestController = require('./make-test');
const MakeAppController = require('./make-app');
const ResolveChangelogController = require('./resolve-changelog');

module.exports = {
	MakeAppController,
	MakeController,
	RenameController,
	MakeTestController,
	ResolveChangelogController
};
