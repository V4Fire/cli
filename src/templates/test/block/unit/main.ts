import type { JSHandle } from 'playwright';

import test from 'tests/config/unit/test';
import Component from 'tests/helpers/component';

import type RName from 'src/components/b-name/b-name.ts';

test.describe('<b-name>', () => {
	const scheme = [
		{
			attrs: {
				id: 'b-name-component'
			}
		}
	];

	let
		node: JSHandle<unknown>,
		component: JSHandle<RName>;

	test.beforeEach(async ({ demoPage, page }) => {
		await demoPage.goto();
		await Component.createComponent(page, 'b-name', scheme);
	});

	test('should be rendered', async ({ page }) => {
		const
			component = await Component.getComponentByQuery(page, '#b-name-component'),
			componentName = await component.getProperty('componentName');

		await test.expect(componentName.jsonValue()).resolves.toBe('b-name');
	});
});
