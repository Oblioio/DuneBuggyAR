const path = require('path');
const appDir = path.resolve(__dirname, '..', 'src');
const distDir = path.resolve(__dirname, '..', 'dist');

module.exports = {
  mode: 'production',
  context: appDir,
  entry: path.resolve(__dirname, '../src', 'index.js'),
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
  }
};