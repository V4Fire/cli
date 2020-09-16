/**
 * [[include:/Users/v-chupurnov/WebstormProjects/v4fire-cli/b-hello-world/README.md]]
 * @packageDocumentation
 */

import iBlock, { component, field, prop } from 'super/i-block/i-block';

export * from 'super/i-block/i-block';

/**
 * BHelloWorld
 */
@component()
export default class bHelloWorld extends iBlock {
	@prop(Number)
	readonly counterProp!: number;

	@field((o) => o.sync.link())
	counter!: number;

	/**
	 * Increase counter
	 */
	increaseCounter(): void {
		this.counter += 1;
	}
}
