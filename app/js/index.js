/*
 *	Require Config
 */
require.config({
	baseUrl: './',
	paths: {
		'jquery': 'lib/jquery/jquery.min'
	},
	shim: {
		'jquery': {
			exports: '$'
		}
	}
});

/*
 * App Execution
 */
define(function() {
	alert('It\'s working');
});