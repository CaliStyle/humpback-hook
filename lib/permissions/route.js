'use strict';

/**
 * Creates default Routes
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
 * Create default Routes
 */

exports.createRoutes = function (roles, models, admin) {
  
    
    console.log('ROLES:', roles);
    console.log('MODELS:', models);
    console.log('ADMIN:', admin);

    sails.log('humpback-hook: syncing app routes');

    var routes = [];
    _.each(sails.config.routes, function (target, address) {
       
        routes.push({
            //route: JSON.stringify(route),
            address: address,
            target: target
            //controller: controller,
            //action: action
        });
    });

    sails.log('humpback-hook:', routes.length ,'routes to sync');
    
    var Route = sails.models[sails.config.permission.routeModelIdentity];
    
    return Promise.map(routes, function (route) {
        //return route;
        console.log(route.address, route.target);

        return Route.updateOrCreate({ address: route.address }, route);
    });

};
