'use strict';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = merge(common, {
  entry: {
    app: PATHS.src + '/app.js',
    background: PATHS.src + '/background.js',
    proxyAjax: PATHS.src + '/proxyAjax.js',
    zhilianFirstOpen: PATHS.src + '/plantforms/zhilian/firstOpen.js',
    offscreen:PATHS.src + '/offscreen/index.js'
  },
});

module.exports = config;
