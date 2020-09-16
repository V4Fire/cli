'use strict';

const
	path = require('upath'),
	config = require('@v4fire/client/config/default'),
	o = require('uniconf/options').option;

module.exports = config.createConfig({dirs: [__dirname, 'client']}, {
	__proto__: config,

	api: {
		proxy() {
			return o('api-proxy', {
				env: true,
				type: 'boolean',
				default: true
			});
		},
	},

	runtime() {
		return {
			...config.runtime(),
			debug: false
		}
	}
});
