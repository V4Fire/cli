/* eslint-disable func-names */
const fs = require('fs');
const readline = require('readline');
const Handlebars = require('handlebars');

const {camelize, ucfirst} = require('./helpers');

/**
 * Camelize string
 * @param {string} str
 */
Handlebars.registerHelper('camelize', function (options) {
  return camelize(options.fn(this));
});

/**
 * Camelize string and upper case first char
 */
Handlebars.registerHelper('capitalize', function (options) {
  return ucfirst(camelize(options.fn(this)));
});

/**
 * Wrap content in these quotes ```
 */
Handlebars.registerHelper('wrapInCodeBlock', function (options) {
  // eslint-disable-next-line prefer-template
  return Handlebars.SafeString('```\n' + options.fn(this) + '\n```');
});

/**
 * Reads a handlebars template and returns output file info
 *
 * @param {string} path
 * @returns {Promise<{ext: string; outputName?: string}>}
 */
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
        outputName = /^{{!.*(output_name=(?<name>[A-Za-z[\].\-_]+?)[^A-Za-z[\].\-_].*}}$)/g.exec(line).groups.name,
        {ext} = /^{{!.*((extension|ext)=(?<ext>[A-Za-z.]+?)[^A-Za-z.].*}}$)/g.exec(line).groups;

      resolve({outputName, ext});

    } catch (error) {
      reject(error);
    }
  });

  return res;
}

module.exports.Handlebars = Handlebars;

module.exports.getOutputFileInfo = getOutputFileInfo;