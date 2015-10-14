/**
 * UserController
 *
 * @description :: Server-side logic for managing humpback User
 * @humpback-docs  :: https://github.com/CaliStyle/humpback/wiki/Controllers#usercontroller
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
 	register: function (req, res) {
		
 		function _tryAgain(err){

 			// Only certain error messages are returned via req.flash('error', someError)
            // because we shouldn't expose internal authorization errors to the user.
            // We do return a generic error and the original request body.
            var flashError = req.flash('error')[0];
            
            if (err || flashError) {
                sails.log.warn(err);
                sails.log.warn(flashError);
            }

            if (err && !flashError ) {
                req.flash('error', 'Error.Passport.Generic');
            }
            else if (flashError) {
                req.flash('error', flashError);
            }

            req.flash('form', req.body);

            if (!req.isSocket) {
            	var redirect = req.query.prev ? req.query.prev : 'back';
                res.redirect(redirect);
            }
            else{
                res.badRequest(flashError);
            }
            
 		}

		sails.passport.protocols.local.register(req.body, function (err, user) {
    		
			if (err || !user) {
                sails.log.warn(err);
                return _tryAgain();
            }
            req.login(user, function (err) {
                
                if (err) {
                    sails.log.warn(err);
                    return _tryAgain();
                }

	    		if (!req.isSocket && req.query.next) {
	                res.status(302).set('Location', req.query.next);
	            }
	            
	            sails.log.info('user', user, 'authenticated successfully');
	            return res.json(user);

        	});
        	
		});
	},
 	create: function (req, res) {
		sails.passport.protocols.local.register(req.body, function (err, user) {
    		if (err) {
    			return res.serverError(err);
    		}

    		res.ok(user);
		});
	}
};
