//////////////////////////////////////
// Build Dependencies
//////////////////////////////////////
var gulp = require('gulp');
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    lr = require('tiny-lr'),
    server = lr(),
    gutil = require('gulp-util'),
	webpack = require('webpack'),
	connect = require('gulp-connect');

//////////////////////////////////////
// Location Abstractions
//////////////////////////////////////
var base = './src',
	dev = './build/dev',
	dist = './build/dist',
	js = base + '/js',
	scss = base + '/scss',
	assets = base + '/assets',
	scssIndex = scss + '/index.scss',
	jsIndex = js + '/index.js',
	htmlindex = base + '/index.html';

//////////////////////////////////////
// Webpack Config (JS Compiling/Modules)
//////////////////////////////////////
var webpackConfig = {
	cache: true,
	entry: jsIndex,
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

//////////////////////////////////////
// Ports and Config Options
//////////////////////////////////////
var EXPRESS_PORT = 8080,
	EXPRESS_ROOT = dev,
	LIVERELOAD_PORT = 35729,
	IMG_COMPRESSION = 3;

//////////////////////////////////////
// Task Mapping
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
    .pipe(sass({ style: 'expanded' }))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest(dev + '/css'))
    .pipe(livereload(server));
});

//////////////////////////////////////
// Image Tasks
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
//////////////////////////////////////
gulp.task('clean', function() {
  return gulp.src([dist, dev], {read: false})
    .pipe(clean());
});

//////////////////////////////////////
// Connection and Server Tasks
//////////////////////////////////////
gulp.task('connect', function() { 
	var express = require('express');
	var app = express();
	app.use(require('connect-livereload')());
	app.use(express.static(EXPRESS_ROOT));
	app.listen(EXPRESS_PORT);
});

//////////////////////////////////////
// Watching Tasks
//////////////////////////////////////
gulp.task('watch', function() {
	
	// Start the Dev Server
	gulp.start('connect');

	// Start LiveReload
	server.listen(LIVERELOAD_PORT, function (err) {
		if (err) {
			return console.log(err)
		};

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