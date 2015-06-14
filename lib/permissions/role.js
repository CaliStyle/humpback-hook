'use strict';

/**
 * Creates default Roles
 *
 * @public
 */
exports.create = function () {
  var Role = sails.models[sails.config.permission.roleModelIdentity];

  return Promise.all([
    Role.findOrCreate({ name: 'admin' }, { name: 'admin' }),
    Role.findOrCreate({ name: 'registered' }, { name: 'registered' }),
    Role.findOrCreate({ name: 'public' }, { name: 'public' })
  ]);
};
