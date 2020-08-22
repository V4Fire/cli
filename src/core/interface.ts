interface Config {
	debug?: boolean;
	override?: boolean;
	path: string;
	name: string;
	newName?: string;
	subject: 'block' | 'page';
	reporter: 'json' | 'plain';
}
