/**
 * RoutePolicy
 * @depends PermissionPolicy
 * @depends OwnerPolicy
 * @depends ModelPolicy
 *
 * Verify that User is satisfactorily allowed to access the route.
 */
module.exports = function(req, res, next) {
	//console.log("Route Policy","DID I RUN?????");
  /*
  if (!_.isEmpty(req.options.modelIdentity)) {
  	
  	return next();
	}
	*/
	//Check if this user has permissions to access the route
	RouteService.findTargetRoute(req)
	.then(function (route){
		sails.log.verbose("ROUTE:", route);
		
		if(!route){
			//Assume that this is handled by Model Permissions
			//Or that this route is public;
			return next();
		}
		
		next();
	})
	.catch(function(err){
		sails.log(err);
		return next();
	});
	
}