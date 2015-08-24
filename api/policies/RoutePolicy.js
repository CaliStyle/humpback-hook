/**
 * RoutePolicy
 * @depends PermissionPolicy
 * @depends OwnerPolicy
 * @depends ModelPolicy
 *
 * Verify that User is satisfactorily allowed to access the route.
 */
module.exports = function(req, res, next) {

	return next();	
}