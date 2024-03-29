'use strict';

/*!
 * V4Fire cli
 * https://github.com/V4Fire/cli
 *
 * Released under the MIT license
 * https://github.com/V4Fire/cli/blob/master/LICENSE
 */

const {expect} = require('chai');

const
	CreateWorkspaceController = require('../src/controllers/create-workspace'),
	packageJSON = require('./cases/package.json');

let controller;

describe('`create-workspace` controller methods', () => {
	beforeEach(() => {
		controller = new CreateWorkspaceController({});
	});

	describe('`getDependencyVersion`', () => {
		it('should return a version of the package', () => {
			const
				getVersion = controller.getDependencyVersion.bind(controller, packageJSON);

			expect(getVersion('@edadeal/core')).to.equal(
				'git+https://gitlab.edadeal.yandex-team.ru/frontend/core.git#npm8'
			);

			expect(getVersion('@v4fire/core')).to.equal('3.65.1');

			expect(getVersion('beta')).to.equal('3.34.3-beta.1');
		});

		it('should do nothing if the package version is not exist', () => {
			expect(controller.getDependencyVersion(packageJSON)).to.equal(undefined);
		});
	});

	describe('`getGitURLFromPackageJSON`', () => {
		it('should return a valid git URL from a repository field with an object type', () => {
			expect(controller.getGitURLFromPackageJSON(packageJSON)).to.equal(
				'git@git.edadeal.yandex-team.ru:frontend/search.git'
			);
		});

		it('should return a valid git URL from a repository field with a string type', () => {
			expect(
				controller.getGitURLFromPackageJSON({
					repository: 'https://gitlab.edadeal.yandex-team.ru/frontend/core.git'
				})
			).to.equal('https://gitlab.edadeal.yandex-team.ru/frontend/core.git');
		});

		it('should return nothing if a repository field is not exist', () => {
			expect(controller.getGitURLFromPackageJSON({})).to.equal(undefined);
		});
	});
});
