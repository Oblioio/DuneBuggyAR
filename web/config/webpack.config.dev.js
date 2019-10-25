const path = require('path');
const appDir = path.resolve(__dirname, '..', 'src');
const staticDir = path.resolve(__dirname, '..', 'static');
const distDir = path.resolve(__dirname, '..', 'dist');

console.log("DEV!");
module.exports = {
  mode: 'development',
  context: appDir,
  devtool: 'source-map',
  entry: './js/index.js', // './src/index.js',
  output: {
    filename: 'js/[name].js',
    path: distDir,
    publicPath: '/',
    sourceMapFilename: '[name].map'
  },
  devServer: {
    contentBase: [appDir, staticDir],
    historyApiFallback: true,
    port: 3000,
    https: true
  },
  resolve: {
    extensions: [".js", ".scss", ".css"],
    modules: [appDir, "node_modules"]
  }
};