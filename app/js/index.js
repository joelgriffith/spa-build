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
define(['jquery'], function($) {
	console.log($());
});