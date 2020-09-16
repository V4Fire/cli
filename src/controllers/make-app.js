const npm = require('npm');
const {Controller} = require('../core/controller');

class MakeAppController extends Controller {
	run() {
		npm.load(myConfigObject, (er) => {
			if (er) {
				throw er;
			}

			npm.commands.install(['jodit'], (er) => {
				if (er) {
					throw er;
				}
			});

			npm.registry.log.on('log', (message) => {
				this.log.info(message);
			});
		});
	}
}

module.exports = MakeAppController;
