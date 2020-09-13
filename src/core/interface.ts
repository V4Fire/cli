interface IConfig {
	debug?: boolean;
	override?: boolean;
	path: string;
	name: string;
	newName?: string;
	subject: 'block' | 'page';
	command?: 'make' | 'rename';
	_: [this['command']];
	reporter: 'json' | 'raw' | 'silent';
	template: 'default' | 'mono' | 'functional';
	extend: 'default' | 'i-block' | 'i-data' | 'i-dynamic-page' | 'i-static-page';
	runners?: string[];
}
