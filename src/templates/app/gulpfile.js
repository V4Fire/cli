'use strict';

module.exports = function (gulp = require('gulp')) {
    require('@v4fire/client/gulpfile')(gulp);
    global.callGulp(module);
};

module.exports();