// @ts-check

const h = include('tests/helpers'),
	u = include('tests/utils'),
	test = u.getCurrentTest();

/**
 * Starts name tests
 *
 * @param {Playwright.Page} page
 * @param {!Object} params
 *
 * @returns {!Promise<void>}
 */
module.exports = async (page, params) => {
	await h.utils.setup(page, params.context);
	await test(page, params);
};
