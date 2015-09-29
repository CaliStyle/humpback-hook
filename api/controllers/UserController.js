/**
 * UserController
 *
 * @description :: Server-side logic for managing humpback User
 * @humpback-docs  :: https://github.com/CaliStyle/humpback/wiki/Controllers#usercontroller
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
 	
 	create: function (req, res) {
		sails.passport.protocols.local.register(req.body, function (err, user) {
    		if (err) {
    			return res.serverError(err);
    		}

    		res.ok(user);
		});
	}
};
