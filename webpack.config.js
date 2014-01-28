var path = require("path");
var webpack = require("webpack");
module.exports = {
	cache: true,
	entry: "./src/js/index.js",
	output: {
		filename: "index.js",
	},
	resolve: {
		modulesDirectories: ['node_modules', 'bower_components'],
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