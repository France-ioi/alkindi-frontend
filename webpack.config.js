const path = require('path');
const webpack = require('webpack');
const SRC = path.resolve(__dirname, "src");

module.exports = {
  devtool: 'inline-source-map',
  entry: {
    vendor: ['react', 'react-dom', 'bootstrap', 'react-bootstrap', 'lodash'],
    index: ['./src/index.js', 'webpack-hot-middleware/client']
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/build/'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        include: SRC,
        loader: 'babel',
        query: {
          babelrc: true
        }
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.(eot|svg|ttf|woff(2)?)(\?v=\d+\.\d+\.\d+)?/,
        loader: 'url-loader'
      }
    ]
  },
  resolve: {
    root: SRC,
    extensions: ['', '.js']
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.CommonsChunkPlugin("vendor", "vendor.js")
  ]
};
