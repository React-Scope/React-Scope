const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: path.join(__dirname, '/chrome-ext/devtools.js'),
  output: {
    path: path.join(__dirname, '/chrome-ext/build'),
    filename: 'bundle.js',
  },
  plugins: [
    new UglifyJSPlugin(),
  ],
  watch: true,
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: [
          'babel-loader',
        ],
      },
    ],
  },
};
