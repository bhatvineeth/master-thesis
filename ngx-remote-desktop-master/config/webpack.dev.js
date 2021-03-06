const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {
    CheckerPlugin
} = require('awesome-typescript-loader');

const commonConfig = require('./webpack.common');
const {
    ENV,
    dir
} = require('./helpers');

module.exports = function (options) {
    return webpackMerge(commonConfig({
        env: ENV
    }), {
        devtool: 'cheap-module-source-map',
        devServer: {
						host: '0.0.0.0',
						disableHostCheck: true,
						watchOptions: {
							poll: true
						},
            port: 9999,
            hot: options.HMR,
            stats: {
                colors: true,
                hash: true,
                timings: true,
                chunks: true,
                chunkModules: false,
                children: false,
                modules: false,
                reasons: false,
                warnings: true,
                assets: false,
                version: false
            }
        },
        entry: {
            'app': './demo/bootstrap.ts',
            'polyfills': './demo/polyfills.ts'
        },
        module: {
            exprContextCritical: false,
            rules: [{
                    enforce: 'pre',
                    test: /\.js$/,
                    loader: 'source-map-loader',
                    exclude: /(node_modules)/
                },
                {
                    enforce: 'pre',
                    test: /\.ts$/,
                    loader: 'tslint-loader',
                    exclude: /(node_modules|release|dist|demo)/
                },
                {
                    test: /\.ts$/,
                    loaders: [
                        'awesome-typescript-loader',
                        'angular2-template-loader'
                    ],
                    exclude: [/\.(spec|e2e|d)\.ts$/]
                }
            ]
        },
        plugins: [
            new CheckerPlugin(),
            new webpack.optimize.CommonsChunkPlugin({
                name: ['polyfills'],
                minChunks: Infinity
            }),
            new HtmlWebpackPlugin({
                template: 'demo/index.html',
                chunksSortMode: 'dependency',
            }),
            new webpack.HotModuleReplacementPlugin()
        ]
    });

};