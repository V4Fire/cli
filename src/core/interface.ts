interface Config {
	override?: boolean;
	path: string;
	name: string;
	newName?: string;
	subject: 'block' | 'page';
	reporter: 'json' | 'plain';
}
