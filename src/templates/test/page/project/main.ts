import test from 'tests/config/project/test';

test.describe('<p-name>', () => {
  test('should be rendered', async ({RName, page}) => {
		await test.expect(page.locator('.p-name')).toBeVisible();
	});
});
