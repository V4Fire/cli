#!/usr/bin/env node

/*!
 * V4Fire cli
 * https://github.com/V4Fire/cli
 *
 * Released under the MIT license
 * https://github.com/V4Fire/cli/blob/master/LICENSE
 */

const yargs = require('yargs');
const {Application} = require('../src/application');

const options = yargs
	.command(
		'make-test <path> [runners..]',
		'Make test for module or component',
		(yargs) => {
			yargs
				.positional('path', {
					demandOption: true,
					type: 'string'
				})
				.positional('runners', {
					type: 'string'
				});
		}
	)

	.command(
		'resolve-changelog',
		'Resolve conflicts in changelog files and sort records by date'
	)

	.command(
		'create-workspace',
		'Creates a workspace for the project dependencies declared within `.pzlrrc`',
		(yargs) => {
			yargs
				.positional('root', {
					default: 'workspace',
					type: 'string'
				})

				.positional('package', {
					type: 'string'
				});
		}
	)

	.command(
		'remove-workspace',
		'Remove a workspace from the project',
		(yargs) => {
			yargs
				.positional('root', {
					default: 'workspace',
					type: 'string'
				});
		}
	)

	.command(
		'up-git',
		'up git dependencies in project'
	)

	.command(
		'deps',
		'format dependencies with compatibility with the private registry'
	)

	.command(
		'make <subject> <name> [path]',
		'Make block, page or app',
		(yargs) => {
			yargs
				.positional('subject', {
					default: 'block',
					type: 'string',
					choices: ['block', 'page', 'app']
				})
				.positional('name', {
					demandOption: true,
					type: 'string'
				})
				.positional('path', {
					type: 'string'
				});
		}
	)
	.command(
		'rename <name> <new-name> [path]',
		'Rename block or page',
		(yargs) => {
			yargs
				.positional('name', {
					type: 'string'
				})
				.positional('new-name', {
					type: 'string'
				})
				.positional('path', {
					type: 'string'
				});
		}
	)
	.option('debug', {
		alias: 'd',
		describe: 'Debug mode',
		default: false,
		type: 'boolean'
	})
	.option('override', {
		alias: 'o',
		describe: 'Override files',
		default: false,
		type: 'boolean'
	})
	.option('no-install', {
		describe: 'No install dependencies',
		default: false,
		type: 'boolean'
	})
	.option('reporter', {
		alias: 'r',
		default: 'raw',
		describe: 'Reporter name',
		choices: ['json', 'raw', 'silent']
	})
	.option('template', {
		alias: 't',
		default: 'default',
		describe: 'Template name',
		choices: ['default', 'mono', 'functional']
	})
	.option('extend', {
		alias: 'e',
		default: 'default',
		describe: 'Extends class',
		choices: ['default', 'i-block', 'i-data', 'i-dynamic-page', 'i-static-page']
	})
	.version(require('../package').version)
	.alias('version', 'v')
	.help('help')
	.alias('help', 'h')
	.alias('help', '?')
	.example(
		'v4fire rename b-loader b-loader-mini',
		'Rename b-loader to b-loader-mini'
	)
	.example('v4fire make block b-point', 'Make i-block b-point')
	.example('v4fire make block point', 'Make i-block b-point')
	.example('v4fire make page card', 'Make i-dynamic-page p-card')
	.example(
		'v4fire make-test src/core/view-history',
		'Make tests for view-history module'
	)
	.example(
		'v4fire make-test src/base/b-slider',
		'Make tests for b-slider component'
	)
	.example(
		'v4fire make-test src/base/b-slider analytics render events',
		'Make tests for b-slider component with different runners'
	)
	.example(
		'v4fire resolve-changelog',
		'Resolve conflicts in changelogs and sort records'
	)
	.epilogue('MIT').argv;

const app = new Application(options);
app.run();
