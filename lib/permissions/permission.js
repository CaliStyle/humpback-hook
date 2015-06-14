'use strict';

//dependencies


var grants = {
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
/*
var modelRestrictions = {
  registered: [
    'Role',
    'Permission',
    'User',
    'Passport'
  ],
  public: [
    'Role',
    'Permission',
    'User',
    'Model',
    'Passport'
  ]
};
*/

/**
 * Grants Admin Permissions
 *
 * @private
 */
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

/**
 * Grants Registered Permissions 
 *
 * @private
 */

function _grantRegisteredPermissions (roles, models, admin) {
  var registeredRole = _.find(roles, { name: 'registered' });

  var permissions = [
    {
      model: _.find(models, { name: 'Permission' }).id,
      action: 'read',
      role: registeredRole.id,
      createdBy: admin.id
    },
    {
      model: _.find(models, { name: 'Model' }).id,
      action: 'read',
      role: registeredRole.id,
      createdBy: admin.id
    },
    {
      model: _.find(models, { name: 'Route' }).id,
      action: 'read',
      role: registeredRole.id,
      createdBy: admin.id
    },
    {
      model: _.find(models, { name: 'User' }).id,
      action: 'update',
      role: registeredRole.id,
      createdBy: admin.id,
      relation: 'owner'
    }
  ];

  return Promise.all(
    _.map(permissions, function (permission) {
      var Permission = sails.models[sails.config.permission.permissionModelIdentity];
      return Permission.findOrCreate(permission, permission);
    })
  );
}

/**
 * Grants Public Permissions 
 *
 * @private
 */

function _grantPublicPermissions (roles, models, admin) {
  var publicRole = _.find(roles, { name: 'public' });

  var permissions = [
    {
      model: _.find(models, { name: 'Permission' }).id,
      action: 'read',
      role: publicRole.id,
      createdBy: admin.id
    },
    {
      model: _.find(models, { name: 'Route' }).id,
      action: 'read',
      role: publicRole.id,
      createdBy: admin.id
    },
    {
      model: _.find(models, { name: 'Model' }).id,
      action: 'read',
      role: publicRole.id,
      createdBy: admin.id
    }
  ];

  return Promise.all(
    _.map(permissions, function (permission) {
      var Permission = sails.models[sails.config.permission.permissionModelIdentity];
      return Permission.findOrCreate(permission, permission);
    })
  );
}

// TODO let users override this in the actual model definition

/**
 * Create default Role permissions
 */
exports.create = function (roles, models, admin) {
  return Promise.all([
    _grantAdminPermissions(roles, models, admin),
    _grantRegisteredPermissions(roles, models, admin),
    _grantPublicPermissions(roles, models, admin)
  ])
  .then(function (permissions) {
    sails.log('humpback-hook: created', permissions.length, 'permissions');
    return;
  });
};

