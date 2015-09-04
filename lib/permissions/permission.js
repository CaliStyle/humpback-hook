'use strict';

//dependencies


var modelGrants = {
  admin: [
    { action: 'create' },
    { action: 'read' },
    { action: 'update' },
    { action: 'delete' }
  ],
  registered: [
    { action: 'create' },
    { action: 'read' }
  ],
  public: [
    { action: 'read' }
  ]
};

/**
 * Grants Admin Permissions
 *
 * @private
 */
function _grantAdminPermissions (roles, models, routes, admin) {
  var adminRole = _.find(roles, { name: 'admin' });
  var Permission = sails.models[sails.config.permission.permissionModelIdentity];

  var permissions = _.flatten(_.map(models, function (modelEntity) {
  //var model = sails.models[modelEntity.identity];

    return _.map(modelGrants.admin, function (permission) {
      var newPermission = {
        model: modelEntity.id,
        action: permission.action,
        role: adminRole.id,
        createdBy: admin.id
      };
      return Permission.findOrCreate(newPermission, newPermission);
    });
  }));

  _.each(routes, function(route){
    var newPermission = {
      route: route.id,
      action: route.verb,
      role: adminRole.id,
      createdBy: admin.id
    };
    permissions.push(
      Permission.findOrCreate(newPermission, newPermission)
    );
  });

  return Promise.all(permissions);
}

/**
 * Grants Other Roles Permissions 
 *
 * @private
 */

function _grantOtherPermissions (roles, models, routes, admin) {
  var adminRole = _.find(roles, { name: 'admin' });
  var permissions = [];

  _.remove(roles, {
    id: adminRole.id
  });

  _.each(roles, function(role){
    //var registeredRole = _.find(roles, { name: 'registered' });

    // Loop through each model
    _.each(models, function(model){
      //See if the model has a permissions object for registered
      if(typeof model.permissions !== 'undefined' && _.isObject(model.permissions[role.name])){
        _.each(model.permissions[role.name], function(permObject, action){
          if(permObject.action){
            var newPerm = {
              model: model.id,
              action: action,
              role: role.id,
              createdBy: admin.id
            };
            
            //if relation is set, then add it into the relation
            if(permObject.relation){
              newPerm.relation = permObject.relation;
            }
            //Add this new perm to the array to be created.
            permissions.push(newPerm);
          }
        });
      }
    });

    _.each(routes, function(route){
      if(typeof route.defaultPermissions !== 'undefined' && route.defaultPermissions.indexOf(role.name) > -1){
        var newPermission = {
          route: route.id,
          action: route.verb,
          role: role.id,
          createdBy: admin.id
        };
        permissions.push(
          newPermission
        );
      }
    });

  });

  return Promise.all(
    _.map(permissions, function (permission) {
      var Permission = sails.models[sails.config.permission.permissionModelIdentity];
      return Permission.findOrCreate(permission, permission);
    })
  );
}

/**
 * Create default Role permissions
 */
exports.create = function (roles, models, routes, admin) {
  return Promise.all([
    _grantAdminPermissions(roles, models, routes, admin),
    _grantOtherPermissions(roles, models, routes, admin)
  ])
  .then(function (permissions) {
    sails.log('humpback-hook: created', permissions.length, 'permissions');
    return;
  });
};

