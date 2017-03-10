const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CheckerPlugin } = require('awesome-typescript-loader')

//
// LOADERS
//

const loaders = {};

loaders.tslint =  {
    test: /\.(tsx?)$/,
    enforce: 'pre',
    loader: 'tslint-loader',
    options: { /* Loader options go here */ }
}

loaders.js = {
    test: /\.(jsx?)$/,
    use: [{
        loader: 'babel-loader',
        options: {
            retainLines: true
        }
    }],
    exclude: /node_modules/
};

loaders.tsx = {
    test: /\.(tsx?)$/,
     use: [{
        loader: 'awesome-typescript-loader',
        options: {
            configFileName: './example/tsconfig.json',
            useBabel: true,
            useCache: true,
            babelOptions: {
                presets: [
                    [
                        'es2015', {
                            modules: false
                        }
                    ]
                ],
                compact: true,
                retainLines: true
            }

        }
    }],
    exclude: /node_modules/
};

//
// PLUGINS
//

const basePlugins = [
    new HtmlWebpackPlugin({
        template: './example/index.html',
        inject: 'body'
    }),
    new webpack.NoEmitOnErrorsPlugin(),
];

const plugins = basePlugins;

//
// ENTRY
//

const applicationEntries = ['./example/example']

module.exports = {
    entry: applicationEntries,

    output: {
        path: path.join(__dirname, 'docs'),
        filename: '[name].[hash].js',
        publicPath: '/',
        sourceMapFilename: '[name].[hash].js.map',
        chunkFilename: '[id].chunk.js'
    },

    devtool: 'inline-source-map',

    resolve: {
        modules: [
            path.resolve('./'),
            'node_modules'
        ],
        extensions: [
            '.tsx',
            '.ts',
            '.js',
            '.json',
            '.css'
        ]
    },

    plugins: plugins,

    devServer: {
        historyApiFallback: { index: '/' }
    },

    module: {
        rules: [
            loaders.tsx
        ]
    }
};
