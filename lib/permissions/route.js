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
function _abstractVerb(address){
  var verb, crud = ['get','post','put','delete'];
  if (_.isString(address)){
    address = address.toLowerCase().split(' ')[0];
    verb = crud.indexOf(address) > -1 ? crud[crud.indexOf(address)] : 'get';
  }

  return verb;
}

function _makeTargetObject(target){
  if(_.isObject(target)){
    return target;
  }
  var object = {};
  var peices = target.split('.');
  
  if(peices.length > 1){
    object.controller = peices[0];
    object.action = peices[1];
  }
  return object;
}

/**
 * Create default Routes
 */

exports.createRoutes = function (roles, models, admin) {
  
    
    sails.log.silly('ROLES:', roles);
    sails.log.silly('MODELS:', models);
    sails.log.silly('ADMIN:', admin);

    sails.log('humpback-hook: syncing app routes');

    var routes = [];
    _.each(sails.config.routes, function (target, address) {
        var uri = _abstractURI(address);
        var verb = _abstractVerb(address);
        
        var routeRoles = [];

        _.each(target.defaultRoles, function(roleName){
          if(roleName !== 'admin'){
            var role = _.find(roles, { name: role });
            if(role){
              routeRoles.push(role);
            }
          }
        });
        //If the defaultRoles is empty add in Public and Registered by defualt
        if(!target.defaultRoles || target.defaultRoles.length === 0){
          routeRoles.push(_.find(roles, { name: 'public' }));
          routeRoles.push(_.find(roles, { name: 'registered' }));
        }
        //Add Admin Role to every route
        routeRoles.push(_.find(roles, { name: 'admin' }));

        console.log(routeRoles);

        target = _makeTargetObject(target);

        routes.push({
            //route: JSON.stringify(route),
            id: new Buffer(verb + ':' + uri).toString('base64'),
            uri: uri,
            address: address,
            target: target,
            verb: verb,
            createdBy: admin.id,
            roles: routeRoles
            //controller: controller,
        });
    });

    sails.log('humpback-hook:', routes.length ,'routes to sync');
    
    var Route = sails.models[sails.config.permission.routeModelIdentity];
    
    return Promise.map(routes, function (route) {
        //return route;
        sails.log(route.address, route.target);

        return Route.findOrCreate({ address: route.address }, route);
    });

};
