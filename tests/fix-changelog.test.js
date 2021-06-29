const {expect} = require('chai');

const complex = require('./cases/fix-changelog/complex');
const boilerplate = require('./cases/fix-changelog/boilerplate');
const sort = require('./cases/fix-changelog/sort');
const conflicts = require('./cases/fix-changelog/conflicts');

const FixChangelogController = require('../src/controllers/fix-changelog');

describe('Fix-changelog controller methods', () => {
	describe('updateChangelogContent', () => {
		complex.cases.forEach((caseEl) => {
			it(caseEl.description, () => {
				expect(
					new FixChangelogController().updateChangelogContent(caseEl.input)
				).to.equal(caseEl.output);
			});
		});
	});

	describe('saveBoilerplate', () => {
		boilerplate.cases.forEach((caseEl) => {
			it(caseEl.description, () => {
				expect(
					new FixChangelogController().saveBoilerplate(caseEl.input)
				).to.equal(caseEl.output);
			});
		});
	});

	describe('sortRecords', () => {
		sort.cases.forEach((caseEl) => {
			it(caseEl.description, () => {
				expect(new FixChangelogController().sortRecords(caseEl.input)).to.equal(
					caseEl.output
				);
			});
		});
	});

	describe('clearConflicts', () => {
		conflicts.cases.forEach((caseEl) => {
			it(caseEl.description, () => {
				expect(
					new FixChangelogController().clearConflicts(caseEl.input)
				).to.equal(caseEl.output);
			});
		});
	});
});
