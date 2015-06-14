/**
* Role.js
*
* @description    :: Stores the type of Role
* @humpback-docs  :: https://github.com/CaliStyle/humpback/wiki/Models#role
* @sails-docs     :: http://sailsjs.org/#!documentation/models
*/


module.exports = {
  autoCreatedBy: false,

  description: 'Confers `Permission` to `User`',
  
  private: false,

  attributes: {
    name: {
      type: 'string',
      //index: true,
      notNull: true,
      unique: true
    },
    users: {
      collection: 'User',
      via: 'roles'
    },
    routes: {
      collection: 'Route',
      via: 'roles'
    },
    alerts: {
      collection: 'Alert',
      via: 'roles'
    },
    active: {
      type: 'boolean',
      defaultsTo: true,
      index: true
    },
    permissions: {
      collection: 'Permission',
      via: 'role'
    }
  }
}