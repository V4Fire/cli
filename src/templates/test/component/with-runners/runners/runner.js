// @ts-check

const h = include('tests/helpers');

/**
 * @param {Playwright.Page} page
 */
module.exports = (page) => {
	describe('b-name runner', () => {
		let bNameComponent, bNameNode;

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
