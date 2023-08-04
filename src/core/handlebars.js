/* eslint-disable func-names */
const Handlebars = require('handlebars');

const {camelize, ucfirst, readFirstLine} = require('./helpers');

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
async function getOutputFileInfo(path) {
  const
    line = await readFirstLine(path),
    opts = line.split(/\s/);

  opts.pop();
  opts.shift();

  return opts.reduce((acc, el) => {
    const
      tuple = el.split('=');

    return {
      ...acc,
      [tuple[0]]: tuple[1]
    };
  }, {});
}

module.exports.Handlebars = Handlebars;

module.exports.getOutputFileInfo = getOutputFileInfo;
