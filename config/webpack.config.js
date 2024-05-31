'use strict';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const vue = require('./webpack.vue.js');
const offscreen = require('./webpack.offscreen.js');
const sidepanel = require('./webpack.sidepanel.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = merge(common,vue,offscreen,sidepanel,{
  mode: process.env.NODE_ENV == 'production' ? 'production' : 'development',
  entry: {
    app: PATHS.src + '/app.js',
    background: PATHS.src + '/background.js',
    proxyAjax: PATHS.src + '/proxyAjax.js',
    zhilianFirstOpen: PATHS.src + '/plantforms/zhilian/firstOpen.js',
  },
});

module.exports = config;
