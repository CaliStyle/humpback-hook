'use strict';

//dependencies
//var path = require('path');
//var libPath = path.join(__dirname, 'lib');


module.exports = function (sails) {
 	return { 
		configure: function () {
      
      //if (!_.isObject(sails.config.humpback)) sails.config.humpback = { };
     
    },
		initialize: function (next) {
			
			sails.after('hook:orm:loaded', function () {
        sails.log.debug('humpback: hooked');

        // Do some stuff here to initialize hook
				// And then call `cb` to continue
				return next();
      });

		}
	};
};