const path = require('path');
const HtmlPlugin = require("html-webpack-plugin");

module.exports = {
  entry: './tools/validator/entry.js',
  plugins: [
    new HtmlPlugin({ template: './tools/validator/index.ejs' }),
  ],
  output: {
    filename: '[name].[contenthash:8].js',
    path: path.resolve(__dirname, 'dist'),
	clean: true,
  },
  mode: 'development'
};