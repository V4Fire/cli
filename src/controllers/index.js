const MakeController = require('./make');
const RenameController = require('./rename');
const MakeTestController = require('./make-test');
const ResolveChangelogController = require('./resolve-changelog');
const CreateWorkspaceController = require('./create-workspace');
const RemoveWorkspaceController = require('./remove-workspace');
const UpGitController = require('./up-yarn-git-dependencies');
const CreateAppController = require('./create-app');
const AiBuddyController = require('./ai-buddy');

module.exports = {
	MakeController,
	RenameController,
	MakeTestController,
	ResolveChangelogController,
	CreateWorkspaceController,
	UpGitController,
	RemoveWorkspaceController,
	CreateAppController,
	AiBuddyController
};
