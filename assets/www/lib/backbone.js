// Filename: libs/backbone/backbone
// Finally lets load the original backbone source code
define(
		[ 'order!jquery', 'order!underscore', 'order!lib/backbone-min.js' ],
		function($, _) {
			// Now that all the orignal source codes have ran and accessed each
			// other
			// We can call noConflict() to remove them from the global name
			// space
			// Require.js will keep a reference to them so we can use them in
			// our modules
			_.noConflict();
			$.noConflict();
			return Backbone.noConflict();
		});


