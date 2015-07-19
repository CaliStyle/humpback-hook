/**
* Route.js
*
* @description    :: Stores the Route 
* @humpback-docs  :: https://github.com/CaliStyle/humpback/wiki/Models#route
* @sails-docs     :: http://sailsjs.org/#!documentation/models
*/


module.exports = {
	
	description: [
        'Defines a particular route `action` that a `Role` can access.',
        'A `User` can navigate to  a route `action` by having a `Role` which',
        'grants the necessary `Permission`.'
    ].join(' '),
  	
  	permissions: {
	    'registered': {
			'create': {action: false,	relation: false},
			'read' 	: {action: true,	relation: false},
    		'update': {action: false,	relation: false},
    		'delete': {action: false,	relation: false}		
    	},
		'public': {
			'create': {action: false,	relation: false},
			'read' 	: {action: true,	relation: false},
    		'update': {action: false,	relation: false},
    		'delete': {action: false,	relation: false}
		}
  	},

	attributes: {
  		/**
         * 
         */
  		route: {
  			type: 'string',
  			required: true
  		},

  		/**
         * 
         */
  		action: {
  			type: 'string',
  			index: true,
            notNull: true,
            enum: [
                'GET',
                'POST',
                'PUT',
                'DELETE'
            ]
  		},

  		/**
         * 
         */
  		roles: {
	    	collection: 'Role',
	    	via: 'routes',
	    	dominant: true
	    },

	    /**
         * 
         */
        permissions: {
            collection: 'Permission',
            via: 'route'
        }
	}
}