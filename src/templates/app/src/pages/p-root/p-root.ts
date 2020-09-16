import iStaticPage, { component, field, system, watch } from 'super/i-static-page/i-static-page';

export * from 'super/i-static-page/i-static-page';

@component({root: true})
export default class pRoot extends iStaticPage {
	readonly $refs!: iStaticPage["$refs"] & {
	};
}
