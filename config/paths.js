'use strict';

const path = require('path');

const PATHS = {
  src: path.resolve(__dirname, '../src'),
  build: path.resolve(__dirname, '../build'),
  vueHtmlTemplate: path.resolve(__dirname, '../template/vue/index.html'),
  vueCacheDirectory: path.resolve(__dirname, "../node_modules/.cache/vue-loader"),
  tsConfig:path.resolve(__dirname, '../tsconfig.json')
};

module.exports = PATHS;
