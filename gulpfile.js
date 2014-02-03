//////////////////////////////////////
// Build Dependencies
//
// These are dependencies for the build
// process, and you're free to remove
// dependencies you're not using.
//////////////////////////////////////
var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    imagemin = require('gulp-imagemin'),
    clean = require('gulp-clean'),
    livereload = require('gulp-livereload'),
    lr = require('tiny-lr'),
    server = lr(),
    gutil = require('gulp-util'),
    info = require('./package.json'),
	webpack = require('webpack');

//////////////////////////////////////
// Location Abstractions
//
// These are abstractions for your 
// project. Things such as build 
// directories and banner comments
// are retrieved from these variables.
//////////////////////////////////////

	// Source Code Directory
	var base = './src',

	// Dev build location to output
	dev = './build/dev',

	// Dist build location to output
	dist = './build/dist',
	
	// JS directory (for watch and hinting)
	js = base + '/js',

	// SCSS directory (for watching)
	scss = base + '/scss',

	// Static assets directory (copying and optimizing)
	assets = base + '/assets',

	// Entry point for your JS app (builds look only at this)
	jsIndex = js + '/index.js',

	// Entry point for your SCSS (builds look only at this)
	scssIndex = scss + '/index.scss',

	// Package title for your comment banners in JS and CSS
	title = info.name,

	// Author title for our comment banners in JS and CSS
	author = info.author,

	// Version information for your comment banners in JS and CSS
	version = info.version,

	// Build# for your comment banners in JS and CSS
	build = Date.now();

//////////////////////////////////////////////
// Webpack Config (JS Compiling/Modules)
//
// Responsbile for compiling JS. Uses
// the Webpack build system for compilation,
// which can build from AMD or CommonJS
// modules.
//////////////////////////////////////////////
var webpackConfig = {
	cache: true,
	entry: jsIndex,
	output: {
		filename: "index.js"
	},
	resolve: {
		modulesDirectories: ['node_modules', 'bower_components']
	},
	plugins: [
		new webpack.BannerPlugin(title + '\n' + author + '\n' + version + ':' + build)
	]
};

//////////////////////////////////////
// Ports and Config Options
//
// These are GLOBAL variables used
// mostly for the dev server and
// LiveReload.
//////////////////////////////////////

	// The port you wish to serve the dev build
	var EXPRESS_PORT = 8080,

	// The root directory for express to look at
	EXPRESS_ROOT = dev,

	// The live reload port (35729 is default)
	LIVERELOAD_PORT = 35729,

	// IMG compression "force"
	IMG_COMPRESSION = 3,

	// Sourcemaps for JS and CSS (neither are supported yet)
	SASS_SOURCE_MAPS = false,
	SASS_COMPASS = false;

//////////////////////////////////////
// Task Mapping
//
// Gulp task abstractions happen here.
// Feel free to move things around to 
// suite your needs.
//////////////////////////////////////
gulp.task('default', ['clean'], function() {
    gulp.start('hint', 'webpack:dev', 'webpack:dist', 'styles:dev', 'styles:dist', 'images:dev', 'images:dist', 'html:dev', 'html:dist');
});
gulp.task('build:dev', ['clean'], function() {
    gulp.start('hint', 'webpack:dev', 'styles:dev', 'images:dev', 'html:dev');
});
gulp.task('build:dist', ['clean'], function() {
    gulp.start('hint', 'webpack:dist', 'styles:dist', 'images:dist', 'html:dist');
});

//////////////////////////////////////
// JavaScript Tasks
//
// All JavaScript tasks here. This
// includes building Dist and Dev
// JS and hinting as well
//////////////////////////////////////

// JS packaging for distribution
gulp.task('webpack:dist', function() {
	// modify some webpack config options
	var myConfig = Object.create(webpackConfig);
	myConfig.output.path = dist + '/js';
	myConfig.plugins = myConfig.plugins.concat(
		new webpack.DefinePlugin({
			'process.env': {
				'NODE_ENV': JSON.stringify('production')
			}
		}),
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.UglifyJsPlugin()
	);
	webpack(myConfig, function(err, stats) {
		if(err) throw new gutil.PluginError('webpack:dist', err);
		gutil.log('[webpack:dist]', stats.toString({
			colors: true
		}));
	});
});

// JS packaging for development
gulp.task('webpack:dev', function() {
	// modify some webpack config options
	var myConfig = Object.create(webpackConfig);
	myConfig.output.path = dev + '/js';
	myConfig.plugins = myConfig.plugins.concat(
		new webpack.DefinePlugin({
			'process.env': {
				'NODE_ENV': JSON.stringify('production')
			}
		})
	);
	webpack(myConfig, function(err, stats) {
		if(err) throw new gutil.PluginError('webpack:dev', err);
		gutil.log('[webpack:dev]', stats.toString({
			colors: true
		}));
		return gulp.src(dev).pipe(livereload(server));
	});
});

// JSHinting
gulp.task('hint', function() {
  return gulp.src(js + '/*.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'));
});

//////////////////////////////////////
// Stylesheet Tasks
//
// All SCSS->CSS tasks are here for
// DEV and DIST
//////////////////////////////////////
gulp.task('styles:dist', function() {
  return gulp.src(scssIndex)
    .pipe(sass({ style: 'compressed' }))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(minifycss())
    .pipe(gulp.dest(dist + '/css'));
});
gulp.task('styles:dev', function() {
  return gulp.src(scssIndex)
    .pipe(sass({ style: 'expanded', sourcemap: SASS_SOURCE_MAPS, compass: SASS_COMPASS }))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest(dev + '/css'))
    .pipe(livereload(server));
});

//////////////////////////////////////
// Image Tasks
//
// Image compression tasks
//////////////////////////////////////
gulp.task('images:dist', function() {
  return gulp.src(assets + '/**/*')
    .pipe(imagemin({ optimizationLevel: IMG_COMPRESSION, progressive: true, interlaced: true }))
    .pipe(gulp.dest(dist + '/assets'));
});
gulp.task('images:dev', function() {
  return gulp.src(assets + '/**/*')
    .pipe(imagemin({ optimizationLevel: IMG_COMPRESSION, progressive: true, interlaced: true }))
    .pipe(gulp.dest(dev + '/assets'))
    .pipe(livereload(server));
});

//////////////////////////////////////
// HTML Tasks
//
// HTML (index.html) copying tasks.
// NOTE: that both DEV and DIST use
// the same index file, so be sure
// your links look in the right place!
//////////////////////////////////////
gulp.task('html:dist', function() {
	return gulp.src(base + '/*.html')
		.pipe(gulp.dest(dist));
});
gulp.task('html:dev', function() {
	return gulp.src(base + '/*.html')
		.pipe(gulp.dest(dev))
		.pipe(livereload(server));
});

//////////////////////////////////////
// Cleanup Tasks
//
// Clean will just delete all files in 
// /dev and /dist to ensure old
// files are removed.
//////////////////////////////////////
gulp.task('clean', function() {
  return gulp.src([dist, dev], {read: false})
    .pipe(clean());
});

//////////////////////////////////////
// Connection and Server Tasks
//
// Builds out the express server and
// LiveReload options. LR uses express
// middleware so there is no need for
// any browser plugins
//////////////////////////////////////
gulp.task('connect', function() {
	var express = require('express');
	var app = express();
	app.use(require('connect-livereload')());
	app.use(express['static'](EXPRESS_ROOT));
	app.listen(EXPRESS_PORT);
});

//////////////////////////////////////
// Watching Tasks
//
// Gulp watch is built here. Looks
// at all .js and .scss files as well
// as images. New files will require a
// restart of the `gulp watch` command.
//////////////////////////////////////
gulp.task('watch', function() {
	
	// Start the Dev Server
	gulp.start('connect');

	// Start LiveReload
	server.listen(LIVERELOAD_PORT, function (err) {
		if (err) {
			return console.log(err);
		}

		// Watch .scss files
		gulp.watch(base + '/scss/*.scss', function(event) {
			gutil.log('Watch:', 'File ' + event.path + ' was ' + event.type + ', running tasks...');
			gulp.start('styles:dev');
		});

		// Watch .js files
		gulp.watch(base + '/js/*.js', function(event) {
			gutil.log('Watch:', 'File ' + event.path + ' was ' + event.type + ', running tasks...');
			gulp.start('hint', 'webpack:dev');
		});

		// Watch image files
		gulp.watch(base + '/assets/img/**/*', function(event) {
			gutil.log('Watch:', 'File ' + event.path + ' was ' + event.type + ', running tasks...');
			gulp.start('images:dev');
		});

		gulp.watch(base + '/index.html', function(event) {
			gutil.log('Watch:', 'File ' + event.path + ' was ' + event.type + ', running tasks...');
			gulp.start('html:dev');
		});
	});
});