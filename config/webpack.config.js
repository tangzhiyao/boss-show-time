'use strict';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { VueLoaderPlugin } = require('vue-loader')

// Merge webpack configuration files
const config = merge(common, {
  mode: process.env.NODE_ENV == 'production' ? 'production' : 'development',
  entry: {
    app: PATHS.src + '/app.js',
    background: PATHS.src + '/background.js',
    proxyAjax: PATHS.src + '/proxyAjax.js',
    zhilianFirstOpen: PATHS.src + '/plantforms/zhilian/firstOpen.js',
    offscreen:PATHS.src + '/offscreen/index.js',
    sidepanel:PATHS.src + '/pages/sidepanel/main.js'
  },
  module:{
    rules:[
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [{
            loader: 'babel-loader',
            options: {
                presets: [['@babel/preset-env', { useBuiltIns: 'usage', corejs: 3 }]],
                cacheDirectory: true,
                cacheCompression: false,
                plugins: ['@babel/plugin-transform-runtime']
            }
        }, {
            loader: "ts-loader",
            options: {
                configFile: PATHS.tsConfig,
                appendTsSuffixTo: [/\.vue$/]
            },
        }]
    },
      {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: {
              cacheDirectory: PATHS.vueCacheDirectory
          }
      },
      {
        test: /\.css$/,
        use: [
            process.env.NODE_ENV == 'production' ? MiniCssExtractPlugin.loader : 'vue-style-loader',
            "css-loader",
            {
                loader: 'postcss-loader',
                options: {
                    postcssOptions: {
                        plugins: [
                            [
                                'postcss-preset-env',
                            ],
                        ],
                    }
                }
            }
        ],
    },
    {
        test: /\.s[ac]ss$/,
        use: [
            process.env.NODE_ENV == 'production' ? MiniCssExtractPlugin.loader : 'vue-style-loader',
            "css-loader",
            {
                loader: 'postcss-loader',
                options: {
                    postcssOptions: {
                        plugins: [
                            [
                                'postcss-preset-env',
                            ],
                        ],
                    }
                }
            },
            'sass-loader',
        ],
      },
    ]
  },
  plugins:[
    new HtmlWebpackPlugin({
      title: 'Sidepanel_html',
      filename: 'sidepanel.html',
      template: PATHS.vueHtmlTemplate,
      chunks: ['sidepanel']
    }),
    new VueLoaderPlugin(),
  ],
  resolve: {
    extensions: ['.vue', '.js', '.ts', '.json'],
    alias: {
        '@': PATHS.src,
    },
},
});

module.exports = config;
