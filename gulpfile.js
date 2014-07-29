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
	webpack = require('webpack'),

	// Sources and outputs
	base = './src',
	dev = './build/dev',
	dist = './build/dist',
	js = base + '/js',
	scss = base + '/scss',
	assets = base + '/assets',
	jsIndex = js + '/index.js',
	scssIndex = scss + '/index.scss',

	// Contstants
	EXPRESS_PORT = 8080,
	EXPRESS_ROOT = dev,
	LIVERELOAD_PORT = 35729,
	IMG_COMPRESSION = 3,
	SASS_SOURCE_MAPS = false,
	SASS_COMPASS = false,

	// Comment Generation
	title = info.name,
	author = info.author,
	version = info.version,
	build = Date.now(),

	// JS Package
	webpackConfigBase = {
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

// Tasks
gulp.task('default', ['clean'], function() {
    gulp.start('hint', 'webpack:dev', 'webpack:dist', 'styles:dev', 'styles:dist', 'images:dev', 'images:dist', 'html:dev', 'html:dist');
});
gulp.task('build:dev', ['clean'], function() {
    gulp.start('hint', 'webpack:dev', 'styles:dev', 'images:dev', 'html:dev');
});
gulp.task('build:dist', ['clean'], function() {
    gulp.start('hint', 'webpack:dist', 'styles:dist', 'images:dist', 'html:dist');
});

// JS packaging for distribution
gulp.task('webpack:dist', function() {
	var myConfig = Object.create(webpackConfigBase);
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
gulp.task('webpack:dev', function() {
	var myConfig = Object.create(webpackConfigBase);
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
gulp.task('hint', function() {
  return gulp.src(js + '/*.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'));
});
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
gulp.task('images:dist', function() {
  return gulp.src(assets + '/**/*')
    .pipe(imagemin({ optimizationLevel: IMG_COMPRESSION, progressive: true, interlaced: true }))
    .pipe(gulp.dest(dist + '/assets'));
});
gulp.task('images:dev', function() {
  return gulp.src(assets + '/**/*')
    .pipe(gulp.dest(dev + '/assets'))
    .pipe(livereload(server));
});
gulp.task('html:dist', function() {
	return gulp.src(base + '/*.html')
		.pipe(gulp.dest(dist));
});
gulp.task('html:dev', function() {
	return gulp.src(base + '/*.html')
		.pipe(gulp.dest(dev))
		.pipe(livereload(server));
});
gulp.task('clean', function() {
  return gulp.src([dist, dev], {read: false})
    .pipe(clean());
});
gulp.task('connect', function() {
	var express = require('express');
	var app = express();
	app.use(require('connect-livereload')());
	app.use(express['static'](EXPRESS_ROOT));
	app.listen(EXPRESS_PORT);
});

gulp.task('watch', function() {
	gulp.start('connect');
	server.listen(LIVERELOAD_PORT, function (err) {
		if (err) {
			return console.log(err);
		}
		gulp.watch(base + '/scss/*.scss', function(event) {
			gutil.log('Watch:', 'File ' + event.path + ' was ' + event.type + ', running tasks...');
			gulp.start('styles:dev');
		});
		gulp.watch(base + '/js/*.js', function(event) {
			gutil.log('Watch:', 'File ' + event.path + ' was ' + event.type + ', running tasks...');
			gulp.start('hint', 'webpack:dev');
		});
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