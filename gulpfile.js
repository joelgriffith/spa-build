var gulp = require('gulp');
var changed = require('gulp-changed');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var autoprefixer = require('gulp-autoprefixer');
var minifycss = require('gulp-minify-css');
var jshint = require('gulp-jshint');
var imagemin = require('gulp-imagemin');
var clean = require('gulp-clean');
var livereload = require('gulp-livereload');
var webpack = require('gulp-webpack');
var lr = require('tiny-lr');
var server = lr();
var gutil = require('gulp-util');
var gulpConfig = require('./gulp.config');

// Tasks
gulp.task('default', ['hint', 'webpack', 'styles', 'images', 'html']);

// JS packaging for distribution
gulp.task('webpack', ['clean'], function() {
	return gulp.src(gulpConfig.scripts.paths.entry)
		.pipe(changed(gulpConfig.scripts.paths.output.dev))
		.pipe(webpack(gulpConfig.webpack))
		.pipe(gulp.dest(gulpConfig.scripts.paths.output.dev))
		.pipe(uglify())
		.pipe(gulp.dest(gulpConfig.scripts.paths.output.prod))
		;
});
gulp.task('hint', function() {
	return gulp.src(gulpConfig.scripts.paths.all)
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter('default'))
		;
});
gulp.task('styles', ['clean'], function() {
	return gulp.src(gulpConfig.styles.paths.entry)
		.pipe(sass())
		.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
		.pipe(gulp.dest(gulpConfig.styles.paths.output.dev))
		.pipe(sass())
		.pipe(minifycss())
		.pipe(gulp.dest(gulpConfig.styles.paths.output.prod))
		;
});
gulp.task('images', ['clean'], function() {
	return gulp.src(gulpConfig.images.paths.all)
		.pipe(gulp.dest(gulpConfig.images.paths.output.dev))
		.pipe(imagemin({
			optimizationLevel: gulpConfig.images.compression,
			progressive: true,
			interlaced: true
		}))
		.pipe(gulp.dest(gulpConfig.images.paths.output.prod))
		;
});
gulp.task('html', ['clean'], function() {
	return gulp.src(gulpConfig.html.paths.entry)
		.pipe(gulp.dest(gulpConfig.html.paths.output.dev))
		.pipe(gulp.dest(gulpConfig.html.paths.output.prod))
		;
});
gulp.task('clean', function() {
	return gulp.src(['./build/dev', './build/prod'], {
			read: false
		})
		.pipe(clean());
});
gulp.task('connect', ['clean'], function() {
	var express = require('express');
	var app = express();
	app.use(require('connect-livereload')());
	app.use(express['static'](gulpConfig.express.root));
	app.listen(gulpConfig.express.root);
});

gulp.task('watch', ['clean'], function() {
	gulp.start('connect');
	server.listen(gulpConfig.liveReload.port, function(err) {
		if (err) {
			return console.log(err);
		}
		gulp.watch(gulpConfig.styles.paths.all, function(event) {
			gutil.log('Watch:', 'File ' + event.path + ' was ' + event.type + ', running tasks...');
			gulp.start('styles');
		});
		gulp.watch(gulpConfig.scripts.paths.all, function(event) {
			gutil.log('Watch:', 'File ' + event.path + ' was ' + event.type + ', running tasks...');
			gulp.start('hint', 'webpack');
		});
		gulp.watch(gulpConfig.images.paths.all, function(event) {
			gutil.log('Watch:', 'File ' + event.path + ' was ' + event.type + ', running tasks...');
			gulp.start('images');
		});
		gulp.watch(gulpConfig.html.paths.entry, function(event) {
			gutil.log('Watch:', 'File ' + event.path + ' was ' + event.type + ', running tasks...');
			gulp.start('html');
		});
	});
});