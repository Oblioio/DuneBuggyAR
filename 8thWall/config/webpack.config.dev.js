const path = require('path');
const appDir = path.resolve(__dirname, '..', 'src');
const staticDir = path.resolve(__dirname, '..', 'static');

console.log("DEV!");
module.exports = {
  mode: 'development',
  context: appDir,
  devtool: 'source-map',
  entry: './js/index.js', // './src/index.js',
  output: {
    filename: 'js/[name].js',
    publicPath: '/',
    sourceMapFilename: '[name].map'
  },
  devServer: {
    contentBase: [appDir, staticDir],
    historyApiFallback: true,
    port: 9000,
    https: true
  }
};