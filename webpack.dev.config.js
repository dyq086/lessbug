/*
 * @Author: yongqing
 * @Date:   2019-05-30 09:26:50
 * @Last Modified by:   yongqing
 * @Last Modified time: 2019-07-16 16:34:30
 */
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
    entry: "./src/index.js",
    output: {
        filename: 'buldles.[hash:8].js',
        path: path.resolve(__dirname, 'dist')
    },
    mode: 'development',
    devServer: {
        port: 3000,
        contentBase: path.resolve(__dirname, 'dist'),
        progress: true
    },
    //增加映射文件，可以帮我们调试代码
    // devtool: 'source-map',1）源码映射，会单独生成source-map文件，出错了会标识当前源文件报错列和行，大而全
    //devtool: 'eval-source-map', // 2)不会产生单数的source-map文件，出错了会标识当前源文件报错列和行
    //devtool: 'cheape-source-map', // 3)会单独生成source-map文件 出错了会标识当前打包转换后的行和列,与无的区别是不会显示时间戳hash 值
    devtool: 'cheape-module-source-map', // 4)不会产生列，但是是一个单独的映射文件，产生后可以保存起来
    plugins: [
        new HtmlWebpackPlugin({
            template: 'index.html',
            title: 'My App',
            filename: 'index.html',
            hash: true,
            inject: 'head'
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"development"'
            }
        })
    ],
    module: {
        //从下往上，从右到左执行
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