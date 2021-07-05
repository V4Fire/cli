const {expect} = require('chai');

const complex = require('./cases/resolve-changelog/complex');
const boilerplate = require('./cases/resolve-changelog/boilerplate');
const sort = require('./cases/resolve-changelog/sort');
const conflicts = require('./cases/resolve-changelog/conflicts');

const ResolveChangelogController = require('../src/controllers/resolve-changelog');

describe('Resolve-changelog controller methods', () => {
	describe('updateChangelogContent', () => {
		complex.cases.forEach((caseEl) => {
			it(caseEl.description, () => {
				expect(
					new ResolveChangelogController().updateChangelogContent(caseEl.input)
				).to.equal(caseEl.output);
			});
		});
	});

	describe('saveBoilerplate', () => {
		boilerplate.cases.forEach((caseEl) => {
			it(caseEl.description, () => {
				expect(
					new ResolveChangelogController().saveBoilerplate(caseEl.input)
				).to.equal(caseEl.output);
			});
		});
	});

	describe('sortRecords', () => {
		sort.cases.forEach((caseEl) => {
			it(caseEl.description, () => {
				expect(
					new ResolveChangelogController().sortRecords(caseEl.input)
				).to.equal(caseEl.output);
			});
		});
	});

	describe('clearConflicts', () => {
		conflicts.cases.forEach((caseEl) => {
			it(caseEl.description, () => {
				expect(
					new ResolveChangelogController().clearConflicts(caseEl.input)
				).to.equal(caseEl.output);
			});
		});
	});
});
