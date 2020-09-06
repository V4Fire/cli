// @ts-check

const h = include('tests/helpers');

/**
 * Tests for name
 *
 * @param {Playwright.Page} page
 * @param {!Object} params
 *
 * @returns {!Promise<void>}
 */
module.exports = async (page, params) => {
	await h.utils.setup(page, params.context);

	describe('name', () => {
		let bDummyComponent, bDummyNode;

		beforeAll(async () => {
			bDummyComponent = await h.component.getComponentById(
				page,
				'dummy-component'
			);
			bDummyNode = await h.dom.waitForEl(page, '#dummy-component');
		});

		it('works', () => {
			expect(bDummyComponent).toBeTruthy();
			expect(bDummyNode).toBeTruthy();
		});
	});
};
