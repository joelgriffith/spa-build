var info = require('./package.json');

module.exports = {
	title: info.title,
	author: info.author,
	version: info.verions,
	build: Date.now(),
	scripts: {
		paths: {
			all: './src/js/**/*.js',
			entry: './src/js/index.js',
			output: {
				dev: './build/dev/js',
				prod: './build/prod/js'
			}
		}
	},
	styles: {
		paths: {
			all: './src/scss/**/*.scss',
			entry: './src/scss/index.scss',
			output: {
				dev: './build/dev/css/',
				prod: './build/prod/css/'
			}
		},
		sourcemaps: false,
		compass: false
	},
	html: {
		paths: {
			entry: './src/index.html',
			output: {
				dev: './build/dev/',
				prod: './build/prod/'
			}
		}
	},
	images: {
		paths: {
			all: ['./src/images/**/*.png', './src/images/**/*.jpg', './src/images/**/*.jpeg'],
			output: {
				dev: './build/dev/images/',
				prod: './build/prod/images/'
			}
		},
		compression: 3
	},
	ports: {
		express: 8080,
		livereload: 35729,
		expressRoot: './build/dev'
	},
	webpackConfig: {
		cache: true,
		resolve: {
			modulesDirectories: ['node_modules', 'bower_components']
		}
	},
	express: {
		port: 8080,
		root: './build/dev'
	},
	liveReload: {
		port: 35729
	}
};