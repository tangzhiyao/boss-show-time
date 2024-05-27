const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { VueLoaderPlugin } = require('vue-loader')
const path = require('path');
const PATHS = require('./paths');

const VuePath = {
    vueCacheDirectory: path.resolve(__dirname, "../node_modules/.cache/vue-loader"),
    tsConfig:path.resolve(__dirname, '../tsconfig.json')
}

const vue = {
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
                    configFile: VuePath.tsConfig,
                    appendTsSuffixTo: [/\.vue$/]
                },
            }]
        },
          {
              test: /\.vue$/,
              loader: 'vue-loader',
              options: {
                  cacheDirectory: VuePath.vueCacheDirectory
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
        new VueLoaderPlugin(),
      ],
      resolve: {
        extensions: ['.vue', '.js', '.ts', '.json'],
        alias: {
            '@': PATHS.src,
        },
    },
};
  
module.exports = vue;