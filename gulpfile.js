/*
 *	Build Dependencies
 */
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
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    lr = require('tiny-lr'),
    server = lr(),
    gutil = require('gulp-util'),
	webpack = require('webpack'),
	webpackConfig = require('./webpack.config.js'),
	connect = require('gulp-connect');

/*
 *	Locations
 */
var base = './src',
	dev = './build/dev',
	dist = './build/dist',
	js = base + '/js',
	scss = base + '/scss',
	assets = base + '/assets';

/*
 * 	Task Associations
 */
gulp.task('default', ['clean'], function() {
    gulp.start('hint', 'webpack:dev', 'webpack:dist', 'styles', 'images', 'html');
});

/*
 *	Webpack Production Build
 */
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

	// run webpack
	webpack(myConfig, function(err, stats) {
		if(err) throw new gutil.PluginError('webpack:build', err);
		gutil.log('[webpack:build-dist]', stats.toString({
			colors: true
		}));
	});
});

/*
 *	Webpack Dev Build
 */
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

	// run webpack
	webpack(myConfig, function(err, stats) {
		if(err) throw new gutil.PluginError('webpack:build', err);
		gutil.log('[webpack:build-dev]', stats.toString({
			colors: true
		}));
		return gulp.src(dev).pipe(livereload(server));
	});
});

/*
 *	JS Hinting
 */
gulp.task('hint', function() {
  return gulp.src(js + '/*.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(notify({ message: 'JSHinting Complete' }));
});

/*
 *	Stylesheets
 */
gulp.task('styles', function() {
  return gulp.src(scss + '/index.scss')
    .pipe(sass({ style: 'expanded' }))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest(dev + '/css'))
    .pipe(minifycss())
    .pipe(gulp.dest(dist + '/css'))
    .pipe(livereload(server))
    .pipe(notify({ message: 'Styles task complete' }));
});

/*
 *	Images
 */
gulp.task('images', function() {
  return gulp.src(assets + '/**/*')
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest(dev + '/assets/img'))
    .pipe(gulp.dest(dist + '/assets/img'))
    .pipe(livereload(server))
    .pipe(notify({ message: 'Images task complete' }));
});

/*
 *	Copying files and assets
 */
gulp.task('html', function() {
	return gulp.src(base + '/index.html')
		.pipe(gulp.dest(dev))
		.pipe(gulp.dest(dist))
	    .pipe(livereload(server))
	    .pipe(notify({ message: 'HTML copying complete' }));
});

/*
 *	Cleanup
 */
gulp.task('clean', function() {
  return gulp.src([dist, dev], {read: false})
    .pipe(clean());
});

/*
 *	Connect
 */
gulp.task('connect', connect({
	root: dev,
	port: 8080,
	open: {
		file: 'index.html',
		browser: 'chrome'
	}
}));

/*
 *	Watch Task Runner
 */
gulp.task('watch', function() {
	// Listen on port 35729
	server.listen(35729, function (err) {
		if (err) {
			return console.log(err)
		};

		// Watch .scss files
		gulp.watch(base + '/scss/*.scss', function(event) {
			gutil.log('Watch:', 'File ' + event.path + ' was ' + event.type + ', running tasks...');
			gulp.start('styles');
		});

		// Watch .js files
		gulp.watch(base + '/js/*.js', function(event) {
			gutil.log('Watch:', 'File ' + event.path + ' was ' + event.type + ', running tasks...');
			gulp.start('hint', 'webpack:dev');
		});

		// Watch image files
		gulp.watch(base + '/assets/img/**/*', function(event) {
			gutil.log('Watch:', 'File ' + event.path + ' was ' + event.type + ', running tasks...');
			gulp.start('images');
		});

		gulp.watch(base + '/index.html', function(event) {
			gutil.log('Watch:', 'File ' + event.path + ' was ' + event.type + ', running tasks...');
			gulp.start('html');
		});
	});
	gulp.start('connect');
});