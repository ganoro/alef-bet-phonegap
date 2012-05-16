// Filename: libs/underscore/underscore
// As above lets load the original underscore source code
define(
		[ 'order!lib/underscore-min.js' ],
		function() {
			// Tell Require.js that this module returns a reference to
			// Underscore
			return _;
		});