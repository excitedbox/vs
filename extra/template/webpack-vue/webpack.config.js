const Path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CopyPlugin = require('copy-webpack-plugin');
const AutoPrefix = require('autoprefixer');
const Webpack = require("webpack");
const Fs = require("fs");

module.exports = {
    mode: 'development',
    resolve: {
        alias: {vue: 'vue/dist/vue.esm.js'},
        extensions: ['.ts', '.js', '.json', '.vue']
    },
    entry: './src/index.ts',
    devtool: 'source-map',
    output: {
        filename: './[name].js',
        path: Path.resolve(__dirname, 'build')
    },
    module: {
        rules: [
            {
                test: /\.(png|svg|jpg|gif)$/,
                loader: 'file-loader?name=/image/[name].[ext]'
            },
            {
                test: /\.s?css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: [AutoPrefix()],
                            sourceMap: true
                        }
                    },
                    'resolve-url-loader',
                    'sass-loader',
                ]
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        ts: [
                            {
                                loader: 'ts-loader',
                                options: {
                                    appendTsSuffixTo: [/\.vue$/]
                                }
                            },
                            {
                                loader: 'source-map-loader',
                            }
                        ]
                    },
                    options: {
                        esModule: true
                    }
                }
            },
            {
                test: /\.ts$/,
                exclude: /(node_modules|bower_components|backup)/,
                use: [
                    {
                        loader: require.resolve('babel-loader'),
                        options: {
                            compact: true,
                        },
                    },
                    {
                        loader: require.resolve('ts-loader'),
                        options: {
                            appendTsSuffixTo: [/\.vue$/],
                        }
                    },
                    {
                        loader: 'source-map-loader',
                    }
                ]
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components|backup)/,
                use: [
                    {
                        loader: 'babel-loader',
                    },
                    {
                        loader: 'source-map-loader',
                    }
                ]
            },
            {
                test: /\.html$/,
                use: ['raw-loader']
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'fonts/'
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new Webpack.DefinePlugin({
            ENV: {
                VERSION: JSON.stringify(JSON.parse(Fs.readFileSync('package.json', 'utf-8'))['version'])
            },
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css'
        }),
        new VueLoaderPlugin(),
        new CopyPlugin([])
    ]
};