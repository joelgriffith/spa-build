var path = require("path");

module.exports = {
	cache: true,
	entry: './js/index.js',
	output: {
		path: path.join(__dirname, "build/dist"),
		publicPath: "build/dist/",
		filename: "[name].js"
	},
	resolve: {
		moduleDirectories: ['node_modules', 'bower_components']
	}
};