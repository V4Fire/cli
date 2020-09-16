'use strict';

/**
 * Обёртка для parallel-webpack, которая умеет убивать его со всеми дочерними процессами.
 * parallel-webpack запускается с флагом --no-stats, и, если process.env.NODE_ENV !== 'production',
 * с флагом --watch.
 *
 * Дополнительные флаги (все остальные пробрасываются в parallel-webpack без изменений):
 *
 * -b — принудительно выключает watch-режим
 * -s — включает вывод статов вебпака.
 *
 * @example
 * $ node pw
 * parallel-webpack --no-stats --watch
 *
 * @example
 * $ node pw -s
 * parallel-webpack --watch
 *
 * @example
 * $ node pw -b
 * parallel-webpack --no-stats
 *
 * @example
 * $ export NODE_ENV=production
 * $ node pw -- --platform android --theme ios
 * parallel-webpack --no-stats -- --platform android --theme ios
 */

require('config');

const
	{spawn} = require('child_process');

const
	commandName = 'parallel-webpack',
	signalCodeBase = 128;

const
	commandPath = require.resolve(`.bin/${commandName}`),
	commandArgs = process.argv.slice(2),
	buildI = commandArgs.indexOf('-b');

const signals = {
	SIGHUP: 1,
	SIGINT: 2,
	SIGTERM: 15
};

if (buildI !== -1) {
	commandArgs.splice(buildI, 1);

} else if (!isProd) {
	commandArgs.unshift('--watch');
}

const
	statsI = commandArgs.indexOf('-s');

if (statsI === -1) {
	commandArgs.unshift('--no-stats');

} else {
	commandArgs.splice(statsI, 1);
}

let
	// eslint-disable-next-line prefer-const
	command;

process.on('exit', (code) => {
	console.log('Exit with code', code);

	if (command && !command.killed) {
		command.kill(9);
	}
});

process.on('uncaughtException', (e) => {
	console.error(e);
	process.exit(1);
});

Object.keys(signals).forEach((sig) => {
	const
		code = signalCodeBase + signals[sig];

	process.on(sig, () => {
		console.log(`\nReceived signal ${sig}`);
		process.exit(code);
	});
});

console.log(`\n${commandName} ${commandArgs.join(' ')}\n`);
command = spawn(process.execPath, [commandPath, ...commandArgs], {stdio: 'inherit'});

command.on('error', (err) => {
	throw err;
});
