// @ts-check

const h = include('tests/helpers');

/**
 * @param {Playwright.Page} page
 */
module.exports = (page) => {
	describe('name runner', () => {
		let
			bDummyComponent,
			bDummyNode;

		beforeAll(async () => {
			bDummyComponent = await h.component.getComponentById(
				page,
				'b-dummy-component'
			);

			bDummyNode = await h.dom.waitForEl(page, '#b-dummy-component');
		});

		it('works', () => {
			expect(bDummyComponent).toBeTruthy();
			expect(bDummyNode).toBeTruthy();
		});
	});
};
