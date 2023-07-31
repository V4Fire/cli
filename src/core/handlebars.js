/* eslint-disable func-names */
const {camelize, ucfirst} = require('./helpers');
const readline = require('readline');
const fs = require('fs');
const Handlebars = require('handlebars');

module.exports.getOutputFileInfo = getOutputFileInfo;

Handlebars.registerHelper('camelize', function (args) {
  return Handlebars.SafeString(camelize(args.fn(this)));
});

Handlebars.registerHelper('capitalize', function (args) {
  return Handlebars.SafeString(ucfirst(camelize(args.fn(this))));
});

function getOutputFileInfo(path) {
	const rl = readline.createInterface({
		input: fs.createReadStream(path)
	});

	let
    resolve,
    reject;

  const res = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

	rl.once('line', (line) => {
    try {
      const
        {name} = /^{{!.*(name=(?<name>[[\]A-Za-z.\-_]+?)[^A-Za-z.[\]].*}}$)/g.exec(line).groups,
        {ext} = /^{{!.*(extension|ext=(?<ext>[A-Za-z.]+?)[^A-Za-z.].*}}$)/g.exec(line).groups;

      resolve({name, ext});

    } catch (error) {
      reject(error);
    }
	});

  return res;
}
