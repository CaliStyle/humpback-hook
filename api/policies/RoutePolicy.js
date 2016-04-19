/**
 * RoutePolicy
 * @depends PermissionPolicy
 * @depends OwnerPolicy
 * @depends ModelPolicy
 *
 * Verify that User is satisfactorily allowed to access the route.
 */

module.exports = function(req, res, next) {

	//Check if this user has the role to access the route

	RouteService.findTargetRoute(req)
	.then(function (route){
		sails.log.verbose('ROUTE:', req.route);

		if(req.options.routeUnlocked){
			//Assume that this is handled by Model Permissions
			//Or that this route is public;
			next();
			return null;
		}

		var options = {
			verb: req.method,
			route: req.route,
		    user: req.user
		};

		RouteService.findUserRouteRoles(options)
	    .then(function (roles) {
	    	sails.log.verbose('RoutePolicy:', roles.length, 'roles grant', req.method, 'on', req.route.uri);
			if (!roles || roles.length === 0) {
				if(req.route.redirect && !req.isSocket){
					return res.redirect(req.route.redirect);
				}else{
					var err = new Error(RouteService.getErrorMessage(options));
					sails.log.verbose(err);
					return res.forbidden(err);
				}
			}

	    	next();
			return null;
	    });
	});

}
