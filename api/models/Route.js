/**
* Route.js
*
* @description    :: Stores the Route 
* @humpback-docs  :: https://github.com/CaliStyle/humpback/wiki/Models#route
* @sails-docs     :: http://sailsjs.org/#!documentation/models
*/

String.prototype.slug = function() {
    var title = this;
    return title
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-');
};

module.exports = {
	
	description: [
        'Defines a particular route `action` that a `Role` can access.',
        'A `User` can navigate to  a route `action` by having a `Role` which',
        'grants the necessary `Permission`. This model also stores the bare',
        'bones for a CMS including Title, Description, URI, and Keywords'
    ].join(' '),

    autoPK: false,
  
    autoCreatedBy: true,
  
    autoCreatedAt: true,
  
    autoUpdatedAt: true,

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
         * the URI of this route
         */
        id: {
            type: 'string',
            primaryKey: true,
            required: true,
            index: true
        },

        uri: {
            type: 'string'
        },

        /**
         * Title of this Route
         */
        title: {
            type: 'string'
        },

        /**
         * Url friendly Title of this Route
         */
        slug: {
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
         * the Featured Image of this route
         */
        image: {
            type: 'string'
        },
        /**
         * optional content for this route
         */
        content: {
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
        },

        /*
         *
         */
        publishAt: {
            type: 'datetime'
        }
	},

    /**
     * Callback to be run before validating a User.
     *
     * @param {Object}   values, the values for the article
     * @param {Function} next
     */
    beforeValidate: [
        function RouteBeforeValidate(values, next){
      
            if(values.title){
                slug = values.title.slug();
                values.slug = slug; 
            }
            next(null, values);
        }
    ]

}