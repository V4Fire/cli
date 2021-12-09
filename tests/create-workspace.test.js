'use strict';

/*!
 * V4Fire cli
 * https://github.com/V4Fire/cli
 *
 * Released under the MIT license
 * https://github.com/V4Fire/cli/blob/master/LICENSE
 */

const {expect} = require('chai');

const CreateWorkspaceController = require('../src/controllers/create-workspace'),
	packageJSON = require('./cases/package.json');

let controller;

describe('`create-workspace` controller methods', () => {
	beforeEach(() => {
		controller = new CreateWorkspaceController({});
	});

	describe('`formatGitVersion`', () => {
		it('should return a version with a prefix `v`', () => {
			expect(controller.formatGitVersion('3.4.5')).to.equal('v3.4.5');
		});

		it('should return a version without changes', () => {
			expect(controller.formatGitVersion('npm8')).to.equal('npm8');
		});
	});

	describe('`getDependencyVersion`', () => {
		it('should return a version of the package', () => {
			expect(
				controller.getDependencyVersion(packageJSON, '@edadeal/core')
			).to.equal(
				'git+https://gitlab.edadeal.yandex-team.ru/frontend/core.git#npm8'
			);
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
			).to.equal('git@git.edadeal.yandex-team.ru:frontend/core.git');
		});

		it('should return nothing if a repository field is not exist', () => {
			expect(controller.getGitURLFromPackageJSON({})).to.equal(undefined);
		});
	});
});
