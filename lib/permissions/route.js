'use strict';

/**
 * Creates default Rotues
 *
 * @public
 */

/**
 * Grants Admin Route Permissions
 *
 * @private
 */
/* 
function _grantAdminPermissions (roles, models, admin) {
  var adminRole = _.find(roles, { name: 'admin' });
  var permissions = _.flatten(_.map(models, function (modelEntity) {
  //var model = sails.models[modelEntity.identity];

    return _.map(grants.admin, function (permission) {
      var newPermission = {
        model: modelEntity.id,
        action: permission.action,
        role: adminRole.id,
        createdBy: admin.id
      };
      var Permission = sails.models[sails.config.permission.permissionModelIdentity];
      return Permission.findOrCreate(newPermission, newPermission);
    });
  }));


  return Promise.all(permissions);
}
*/

/**
 * Create default Route permissions
 */
exports.create = function (roles, models, admin) {
	var Route = sails.models[sails.config.permission.routeModelIdentity];
	console.log(Route, roles, models, admin);

	console.log('Routes:', sails.config.routes);

	return Promise.all([

	]);
	
};