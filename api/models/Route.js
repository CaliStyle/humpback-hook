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
        'grants the necessary `Permission`. This model also stores the bare',
        'bones for a CMS including Title, Description, URI, and Keywords'
    ].join(' '),

    autoPK: true,
  
    autoCreatedBy: false,
  
    autoCreatedAt: false,
  
    autoUpdatedAt: false,

    reserved: true,
  	
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
         * Title of this Route
         */
        title: {
            type: 'string'
        },
        
        /**
         * Description of this Route
         */
        description: {
            type: 'string'
        },

        /**
         * Keywords for this Route
         */
        keywords: {
            type: 'array',
            defaultsTo: []
        },

        /**
         * the URI of this route
         */
        uri: {
            type: 'string'
        },

        /**
         * the Featured Image of this route
         */
        image: {
            type: 'string'
        },

        /**
         * 'GET /foo/bar': 'FooController.bar'
         * ^^^^address^^^^
         */
  		address: {
  			type: 'string',
  			required: true,
            index: true
  		},

        /**
         * 'GET /foo/bar': 'FooController.bar'
         *                 ^^^^^^target^^^^^^^
         */
        target: {
            type: 'string',
            required: true,
            index: true
        },

        /**
         * Method used to call the controller
         */
        method: {
            type: 'string',
            index: true,
            defaultsTo: 'get',
            enum: [
                'get',
                'post',
                'put',
                'delete'
            ]
        },

        /**
         * The controller to apply policy too
         */
        controller: {
            type: 'string',
            index: true,
            //notNull: true
        },

  		/**
         * the controller action to apply policy too
         */
  		action: {
  			type: 'string',
  			index: true,
            //notNull: true,
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