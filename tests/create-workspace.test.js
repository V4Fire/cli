const {expect} = require('chai');

const CreateWorkspaceController = require('../src/controllers/create-workspace');
const packageJSON = require('./cases/package.json');

let controller;

describe('Create-workspace controller methods', () => {
	beforeEach(() => {
		controller = new CreateWorkspaceController({});
	});

	describe('formatGitVersion', () => {
		it('should return version with prefix v', () => {
			expect(controller.formatGitVersion('3.4.5')).to.equal('v3.4.5');
		});

		it('should return version without changes', () => {
			expect(controller.formatGitVersion('npm8')).to.equal('npm8');
		});
	});

	describe('getDependencyVersion', () => {
		it('should return version of package', () => {
			expect(
				controller.getDependencyVersion(packageJSON, '@edadeal/core')
			).to.equal(
				'git+https://gitlab.edadeal.yandex-team.ru/frontend/core.git#npm8'
			);
		});

		it('should do nothing if verions is not exist', () => {
			expect(controller.getDependencyVersion(packageJSON)).to.equal(undefined);
		});
	});

	describe('purifyGitURLFromPackageJSON', () => {
		it('should return purified git url to dependency', () => {
			expect(
				controller.purifyGitURLFromPackageJSON(
					'git+https://gitlab.edadeal.yandex-team.ru/frontend/core.git#npm8'
				)
			).to.equal('gitlab.edadeal.yandex-team.ru/frontend/core.git#npm8');
		});
	});

	describe('getGitURLFromPackageJSON', () => {
		it('should return valid git url from field repository with type object', () => {
			expect(controller.getGitURLFromPackageJSON(packageJSON)).to.equal(
				'git@git.edadeal.yandex-team.ru:frontend/search.git'
			);
		});

		it('should return valid git url from field repository with type string', () => {
			expect(
				controller.getGitURLFromPackageJSON({
					repository: 'https://gitlab.edadeal.yandex-team.ru/frontend/core.git'
				})
			).to.equal('git@git.edadeal.yandex-team.ru:frontend/core.git');
		});

		it('should return nothing if field repository not exist', () => {
			expect(controller.getGitURLFromPackageJSON({})).to.equal(undefined);
		});
	});
});
