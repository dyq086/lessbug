/*
 * @Author: yongqing
 * @Date:   2019-05-30 09:26:50
 * @Last Modified by:   yongqing
 * @Last Modified time: 2019-07-18 16:37:09
 */
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
module.exports = {
    entry: {
        index: './src/index.js',

    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'index.js',
        libraryTarget: 'umd',
        library: 'lessbug'
    },
    mode: 'production',
    plugins: [

        //清除插件
        new CleanWebpackPlugin({
            path: path.resolve(__dirname, 'dist'),
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        })
    ],
    module: {
        rules: [{
                test: /\.js$/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: [
                            '@babel/plugin-proposal-class-properties',
                            '@babel/plugin-transform-runtime'
                        ]
                    }
                }],
                include: path.resolve(__dirname, "src"),
                exclude: /\node_modules/
            }

        ]
    }
}