const path = require('path');
const {processFile} = require('intelli-buddy');
const {Controller} = require('../core/controller');

class AiBuddyController extends Controller {
	/** @override */
	async run() {
		const
			{path: filePath, showDiff} = this.config;

		await processFile(path.resolve(filePath), showDiff);
	}
}

module.exports = AiBuddyController;
