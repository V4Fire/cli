#!/usr/bin/env node

'use strict';

const yargs = require('yargs');
const { Application } = require("../src/application");

const options = yargs
	.command('make <subject> <name> [path]', 'Make block or page', (yargs) => {
		yargs
			.positional('subject', {
				default: 'block',
				type: 'string',
				choices: ['block', 'page']
			})
			.positional('name', {
				demandOption: true,
				type: 'string'
			})
			.positional('path', {
				type: 'string'
			})
	})
	.command('rename <name> <new-name> [path]', 'Rename block or page', (yargs) => {
		yargs
			.positional('name', {
				type: 'string'
			})
			.positional('new-name', {
				type: 'string'
			})
			.positional('path', {
				type: 'string'
			})
	})
	.option('reporter', {
		alias: 'r',
		default: 'json',
		describe: 'Reporter name',
		choices: ['json', 'plain']
	})
	.version(require('../package').version)
	.alias('version', 'v')
	.help('help')
	.alias('help', 'h')
	.alias('help', '?')
	.example('v4fire rename b-loader b-loader-mini', 'Rename b-loader to b-loader-mini')
	.example('v4fire make block b-point', 'Make i-block b-point')
	.example('v4fire make block point', 'Make i-block b-point')
	.example('v4fire make page card', 'Make i-dynamic-page p-card')
	.epilogue('MIT')
	.argv;

const app = new Application(options);
app.run();

