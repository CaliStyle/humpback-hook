/**
 * RoutePolicy
 * @depends PermissionPolicy
 * @depends OwnerPolicy
 * @depends ModelPolicy
 *
 * Verify that User is satisfactorily allowed to access the route.
 */

module.exports = function(req, res, next) {
	

	
	//Check if this user has permissions to access the route
	//Promise.bind({}, RouteService.findTargetRoute(req)
		RouteService.findTargetRoute(req)
		.then(function (route){
			sails.log.verbose("ROUTE:", route);
			
			if(req.options.routeUnlocked){
				//Assume that this is handled by Model Permissions
				//Or that this route is public;
				return next();
			}

			var options = {
				method: req.method,
			    roles: req.route.roles,
			    user: req.user
			};

			RouteService.findUserRouteRoles(options)
		    .then(function (roles) {
		      sails.log.verbose('RoutePolicy:', roles.length, 'roles grant',
		          req.method, 'on', req.route.uri, 'for', req.user.username);

		      if (!roles || roles.length === 0) {
		        return res.badRequest({ error: RouteService.getErrorMessage(options) });
		      }

		      next();
		    });

			//return RouteService.findRoutePermissions()
			//next();
		});
	//);
}