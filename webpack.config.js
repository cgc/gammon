module.exports = {
  context: __dirname + '/app', // eslint-disable-line prefer-template
  entry: './index',
  output: {
    path: __dirname + '/dist', // eslint-disable-line prefer-template
    publicPath: '/dist/',
    filename: 'index.js',
  },

  module: {

    loaders: [
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader', 'postcss'],
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015', 'stage-2'],
        },
      },
    ],
  },

  postcss: [
    require('postcss-import'),
    require('postcss-custom-properties')(),
    require('postcss-color-function'),
    require('postcss-calc'),
  ],
};
