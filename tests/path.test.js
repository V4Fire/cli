const {expect} = require('chai');
const {getApplication} = require('./staff/helpers');

describe('Change path option', () => {
	it('should create component inside path folder', async () => {
		const app = getApplication({
			command: 'make',
			subject: 'block',
			name: 'test',
			path: './src/base/test/best/pop/'
		});

		await app.run();

		expect(app.vfs.exists('./src/base/test/best/pop/b-test/b-test.ss')).is.true;
	});

	it('should change relative path inside MD files', async () => {
		const app = getApplication({
			command: 'make',
			subject: 'block',
			name: 'test',
			path: './src/base/test/best/pop/'
		});

		await app.run();

		expect(
			app.vfs.readFile('./src/base/test/best/pop/b-test/b-test.ts')
		).contains('[[include:base/test/best/pop/b-test/README.md]]');

		expect(
			app.vfs.readFile('./src/base/test/best/pop/b-test/README.MD')
		).contains('# base/test/best/pop/b-test');
	});
});
