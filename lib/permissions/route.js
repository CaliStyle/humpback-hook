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

function _abstractURI(address){

  if (_.isString(address)){
    address = address.split(' ').pop();
  }
  return address;

}
function _abstractMethod(address){
  var method, crud = ['get','post','put','delete'];
  if (_.isString(address)){
    address = address.toLowerCase().split(' ')[0];
    method = crud.indexOf(address) > -1 ? crud[crud.indexOf(address)] : 'get';
  }

  return method;
}

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
        var id = _abstractURI(address);
        routes.push({
            //route: JSON.stringify(route),
            id: id,
            uri: id,
            address: address,
            target: target,
            method: _abstractMethod(address)
            //controller: controller,
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
