var path = require("path");
var webpack = require("webpack");

module.exports = {
	cache: true,
	entry: {
		jquery: "./js/index.js"
	},
	output: {
		path: path.join(__dirname, "dist"),
		publicPath: "dist/",
		filename: "[name].js",
		chunkFilename: "[chunkhash].js"
	},
	resolve: {
		alias: {
			// Bind version of jquery
			jquery: "jquery"
		}
	},
	plugins: [
		new webpack.ProvidePlugin({
			// Automtically detect jQuery and $ as free var in modules
			// and inject the jquery library
			// This is required by many jquery plugins
			jQuery: "jquery",
			$: "jquery"
		})
	]
};