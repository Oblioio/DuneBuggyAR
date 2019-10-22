const path = require('path');
const appDir = path.resolve(__dirname, '..', 'src');
const distDir = path.resolve(__dirname, '..', 'dist');

console.log("DEV!");
module.exports = {
  mode: 'development',
  context: appDir,
  devtool: 'source-map',
  entry: './index.js', // './src/index.js',
  output: {
    filename: '[name].js',
    path: distDir,
    publicPath: '/',
    sourceMapFilename: '[name].map'
  },
  devServer: {
    // disableHostCheck: true,
    contentBase: appDir,
    publicPath: '/',
    historyApiFallback: true,
    port: 9000,
    https: true
  },
  resolve: {
    extensions: [".js", ".scss", ".css"],
    modules: [appDir, "node_modules"]
  }
};