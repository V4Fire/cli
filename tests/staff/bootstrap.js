const path = require('path');
const fs = require('fs-extra');

afterEach(() => {
	fs.removeSync(path.resolve(process.cwd(), './test-app'));
	fs.removeSync(path.resolve(process.cwd(), './src/base'));
	fs.removeSync(path.resolve(process.cwd(), './src/pages'));
});
