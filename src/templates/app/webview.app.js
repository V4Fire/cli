'use strict';

require('sugar').extend();

const
	$C = require('collection.js'),
	config = require('config');

const
	path = require('upath'),
	url = require('url'),
	concatUrls = require('urlconcat').concat;

const
	express = require('express'),
	proxy = require('express-http-proxy');

const
	{api, src} = config,
	app = express();

if (api.proxy()) {
	$C(api.schema).forEach((url, nm) => {
		const
			nms = nm.split(':');

		app.use(`/${nms[0]}`, proxy(url, {
			limit: '10mb',
			filter: (req) => req.baseUrl === concatUrls('/', nms[0]),
			proxyReqPathResolver: (req) => {
				const
					nmsLength = nms.length;

				if (nmsLength > 1 && nms[nmsLength - 1]) {
					return concatUrls('/', nms[nmsLength - 1], req.url);
				}

				return req.url;
			},
			proxyReqOptDecorator(proxyReqOpts) {
				proxyReqOpts.rejectUnauthorized = false;
				return proxyReqOpts;
			}
		}));
	});
}

app.use('/dist/client', express.static(src.clientOutput()));
app.use('/assets', express.static(src.assets()));

[
	['/**', 'p-root']
].forEach(([route, file]) => {
	file = `p-root.html`;

	app.get(route, (req, res) => {
		const
			{query} = req;

		if ('token' in query) {
			const
				reqUrl = url.parse(req.url);

			reqUrl.search = reqUrl.query = Object.toQueryString(Object.reject(query, 'token'));
			res.cookie('token', query.token, {maxAge: (5).minutes(), path: '/'});
			res.redirect(301, url.format(reqUrl));
			return;
		}

		return res.sendFile(path.join(src.clientOutput(), file));
	});
});

module.exports = app.listen(api.port);
console.log('App launched');
console.log(`http://localhost:${api.port}`);
