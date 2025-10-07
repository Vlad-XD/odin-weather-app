const { merge } = require('webpack-merge');
const config = require('./webpack.config.js');
const fileWatchList = ["./src/index.html"];

module.exports = merge(config, {
  mode: 'development',
  devServer: {
    watchFiles: fileWatchList,
    open: {
      app: {
        name: 'google-chrome',
      }
    },
  },
    devtool: "eval-source-map",
    plugins: [

    ],
});
