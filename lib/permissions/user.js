'use strict';

/**
 * Create admin user.
 * @param adminRole - the admin role which grants all permissions
 * @public 
 */
exports.create = function (roles, userModel) {
  
  var err;

  if (_.isEmpty(sails.config.humpback.adminUsername)) {
    err = new Error();
    err.code = 'E_HOOK_INITIALIZE';
    err.name = 'Humpback Hook Error';
    err.message = 'sails.config.humpback.adminUsername is not set';
    throw err;
  }
  if (_.isEmpty(sails.config.humpback.adminPassword)) {
    err = new Error();
    err.code = 'E_HOOK_INITIALIZE';
    err.name = 'Humpback Hook Error';
    err.message = 'sails.config.humpback.adminPassword is not set';
    throw err;
  }
  /* Since not all of passport/humpback uses an email, let's ignore it here
  if (_.isEmpty(sails.config.humpback.adminEmail)) {
    throw new Error('sails.config.permissions.adminEmail is not set');
  }
  */

  var User = sails.models[sails.config.humpback.userModelIdentity];

  return User.findOne({ username: sails.config.humpback.adminUsername })
    .then(function (user) {
      
      if (user) {
        return user;
      }

      sails.log('humpback-hook: admin user does not exist; creating...');
      return User.register({
        username: sails.config.humpback.adminUsername,
        password: sails.config.humpback.adminPassword,
        //email: sails.config.humpback.adminEmail,
        roles: [ _.find(roles, { name: 'admin' }).id ],
        createdBy: 1,
        owner: 1,
        model: userModel.id
      });
  });
};
