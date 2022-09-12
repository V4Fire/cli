
/*!
 * V4Fire cli
 * https://github.com/V4Fire/cli
 *
 * Released under the MIT license
 * https://github.com/V4Fire/cli/blob/master/LICENSE
 */

const {expect} = require('chai');

const
	{VirtualFileSystem} = require('../src/core/vfs'),
	CreateUpYarnGitDependenciesController = require('../src/controllers/up-yarn-git-dependencies');

let controller;

describe('`up-git-dependencies` controller methods', () => {
	beforeEach(() => {
		controller = new CreateUpYarnGitDependenciesController({}, new VirtualFileSystem());
	});

	it('should extract all dependencies from package.json', () => {
		console.log(controller.vfs.resolve('tests/cases/package.json'));
		controller.packageJSONPath = controller.vfs.resolve('tests/cases/package.json');

		expect(controller.projectDependencies).to.deep.equal(
			{
				'@edadeal/core': 'git+https://gitlab.edadeal.yandex-team.ru/frontend/core.git#npm8',
				'@edadeal/design-system': 'git+https://gitlab.edadeal.yandex-team.ru/frontend/design-system.git#v.86',
				'@v4fire/client': 'git+https://github.com/V4Fire/Client.git#webpack-cli/v2',
				'@v4fire/core': '^3.65.1'
			}
		);
	});

	it('should return all Git dependencies from the project `package.json`', () => {
		expect(controller.gitDependencies).to.deep.equal([]);

		controller.dependencies = ['@edadeal/core', '@edadeal/design-system', '@v4fire/client', '@v4fire/core'];
		controller.packageJSONPath = controller.vfs.resolve('tests/cases/package.json');
		controller.extractGitDependencies();

		expect(controller.gitDependencies).to.deep.deep.equal(['@edadeal/core', '@edadeal/design-system', '@v4fire/client']);
	});

	it('should return the contents of the dependency lock file', () => {
		controller.lockFilePath = controller.vfs.resolve('tests/cases/yarn.lock');

		expect(controller.lockFile).to.equal(
`"@edadeal/design-system@git+https://gitlab.edadeal.yandex-team.ru/frontend/design-system.git#EDADEALCORECASE-1207":
  version: 0.1.0
  resolution: "@edadeal/design-system@https://gitlab.edadeal.yandex-team.ru/frontend/design-system.git#commit=27e4ac2cdc3827e987cfa765362bf23113d024bb"
  checksum: e42753408a22a1f1dac2b3d1ecb48da0684190749fefdf6e13f38b06de9845d30c52be030a5908579aea68a69a8ebf35afb0ba3c40259991d3dbffc875ea3b13
  languageName: node
  linkType: hard

"@gar/promisify@npm:^1.1.3":
  version: 1.1.3
  resolution: "@gar/promisify@npm:1.1.3::__archiveUrl=https%3A%2F%2Fnpm.yandex-team.ru%2F%40gar%252fpromisify%2F-%2Fpromisify-1.1.3.tgz%3Frbtorrent%3D256dd71119a0b31cff5d0313253ae4c4b435d693"
  checksum: 4059f790e2d07bf3c3ff3e0fec0daa8144fe35c1f6e0111c9921bd32106adaa97a4ab096ad7dab1e28ee6a9060083c4d1a4ada42a7f5f3f7a96b8812e2b757c1
  languageName: node
  linkType: hard`
		);
	});

	it('should remove only Git dependencies from the lock file', () => {
		controller.lockFilePath = controller.vfs.resolve('tests/cases/yarn.lock');
		controller.gitDependencies = ['@edadeal/core', '@edadeal/design-system', '@v4fire/client'];
		controller.updateLockFile = (content) => content;

		expect(controller.removeGitDependenciesFromLockFile()).to.equal(
`
"@gar/promisify@npm:^1.1.3":
  version: 1.1.3
  resolution: "@gar/promisify@npm:1.1.3::__archiveUrl=https%3A%2F%2Fnpm.yandex-team.ru%2F%40gar%252fpromisify%2F-%2Fpromisify-1.1.3.tgz%3Frbtorrent%3D256dd71119a0b31cff5d0313253ae4c4b435d693"
  checksum: 4059f790e2d07bf3c3ff3e0fec0daa8144fe35c1f6e0111c9921bd32106adaa97a4ab096ad7dab1e28ee6a9060083c4d1a4ada42a7f5f3f7a96b8812e2b757c1
  languageName: node
  linkType: hard`
		);
	});
});
