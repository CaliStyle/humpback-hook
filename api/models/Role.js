/**
* Role.js
*
* @description    :: Stores the type of Role
* @humpback-docs  :: https://github.com/CaliStyle/humpback/wiki/Models#role
* @sails-docs     :: http://sailsjs.org/#!documentation/models
*/


module.exports = {
  
  autoCreatedBy: false,

    description: 'Confers "Permission" to "User"',
  
    permissions: {
        'registered': {
			'create': {action: false,	relation: false},
			'read' 	: {action: false,	relation: false},
			'update': {action: false,	relation: false},
			'delete': {action: false,	relation: false}		
		},
		'public': {
			'create': {action: false,	relation: false},
			'read' 	: {action: false,	relation: false},
			'update': {action: false,	relation: false},
			'delete': {action: false,	relation: false}
		}
    },

    attributes: {
        
        /**
         * The Name of the Role
         */
        name: {
            type: 'string',
            //index: true, //Water line can index strings
            notNull: true,
            unique: true
        },

        /**
         * If the Role is 
         */
        active: {
            type: 'boolean',
            defaultsTo: true,
            index: true
        },

        /**
         * 
         */
        permissions: {
            collection: 'Permission',
            via: 'role'
        },

        /**
         * 
         */
        users: {
            collection: 'User',
            via: 'roles'
        },

        /**
         * 
         */
        routes: {
            collection: 'Route',
            via: 'roles'
        },

        /**
         * 
         */
        alerts: {
            collection: 'Alert',
            via: 'roles'
        }
    }
}