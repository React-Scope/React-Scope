const path = require('path');

module.exports = {
  entry: path.join(__dirname, '/chrome-ext/devtools.js'),
  output: {
    path: path.join(__dirname, '/chrome-ext/build'),
    filename: 'bundle.js',
  },
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
