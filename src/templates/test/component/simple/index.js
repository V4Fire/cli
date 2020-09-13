// @ts-check

const h = include('tests/helpers');

/**
 * Tests for b-name
 *
 * @param {Playwright.Page} page
 * @param {!Object} params
 *
 * @returns {!Promise<void>}
 */
module.exports = async (page, params) => {
	await h.utils.setup(page, params.context);

	describe('b-name', () => {
		let
			bNameComponent,
			bNameNode;

		const scheme = [
			{
				attrs: {
					id: 'b-name-component'
				}
			}
		];

		beforeEach(async () => {
			await page.evaluate((scheme) => {
				globalThis.removeCreatedComponents();
				globalThis.renderComponents('b-name', scheme);
			}, scheme);

			bNameComponent = await h.component.getComponentById(
				page,
				'b-name-component'
			);

			bNameNode = await page.$('#b-name-component');
		});

		it('works', () => {
			expect(bNameComponent).toBeTruthy();
			expect(bNameNode).toBeTruthy();
		});
	});
};
