function buildConfig (env) {

  let file;
  if (env.development) {
    file = 'dev';
  } else if (env.production) {
    file = 'prod';
  } else {
    throw new Error('You must set environment to either development or production in webpack call. e.g. webpack --env.production');
  }

  return require('./config/webpack.config.' + file + '.js');
}

module.exports = env => buildConfig(env);