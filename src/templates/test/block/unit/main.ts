import type { JSHandle } from 'playwright';

import test from 'tests/config/unit/test';
import Component from 'tests/helpers/component';

import type { RName } from 'src/components/b-name/b-name.ts';

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

  test.beforeEach(async ({demoPage, page}) => {
    await demoPage.goto();
    await Component.createComponent(page, 'b-name', scheme);
  });

  test('should be rendered', async ({page}) => {
    node = await page.waitForSelector('#b-name-component');
    component = await node.evaluateHandle((ctx) => ctx['component']['componentName']);

    test.expect(node).toBeTruthy();
    await test.expect(component.jsonValue()).resolves.toBe('b-name');
  });
});
