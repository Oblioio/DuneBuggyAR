const path = require('path');
const appDir = path.resolve(__dirname, '..', 'src');
const staticDir = path.resolve(__dirname, '..', 'static');
const distDir = path.resolve(__dirname, '..', 'dist');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  context: appDir,
  entry: path.resolve(__dirname, '../src', 'js/index.js'),
  output: {
    filename: 'js/[name].js',
    path: distDir,
    publicPath: '/'
  },
  module: {
      rules: [
        {
            test: /\.js$/,
            include: [
                path.resolve(__dirname, '../src')
            ],
            use: [
                {
                    loader: 'babel-loader',
                    'options': {
                        sourceMap: true,
                        presets: [['@babel/preset-env', {
                            modules: false,
                            useBuiltIns: 'entry'
                        }]],
                        plugins: [],
                        babelrc: false
                    }
                },
            ],
        }
      ]
  },
  plugins: [
    new CopyPlugin([
      {
        from: '**/*',
        to: distDir,
        context: staticDir,
      },
    ]),
  ]
};