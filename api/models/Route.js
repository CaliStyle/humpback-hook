/**
* Route.js
*
* @description    :: Stores the Route 
* @humpback-docs  :: https://github.com/CaliStyle/humpback/wiki/Models#route
* @sails-docs     :: http://sailsjs.org/#!documentation/models
*/

function _abstractURI(address){

  if (_.isString(address)){
    address = address.split(' ').pop();
  }
  return address;

}
function _abstractMethod(address){
  var method, crud = ['get','post','put','delete'];
  if (_.isString(address)){
    address = address.toLowerCase().split(' ')[0];
    method = crud.indexOf(address) > -1 ? crud[crud.indexOf(address)] : 'get';
  }

  return method;
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
            type: 'json',
            required: true,
            index: true
        },

        /**
         * Method (verb) used to call the controller
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
         * The controller
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

        
	},

    /**
     * Callback to be run before validating a Route.
     *
     * @param {Object}   values, the values for the article
     * @param {Function} next
     */
    beforeValidate: [
        function RouteBeforeValidateArgs(values, next){
            if(values.target){
                values.target = _makeTargetObject(values.target);
            }
            if(values.address){
                values.uri = _abstractURI(values.address);
                values.method = _abstractMethod(values.address);
            }

            next(null, values);
        },
        /**
         * Create the ID;
         */
        function RouteBeforeValidateCreateId (values, next){
            
            values.id = new Buffer(values.method + ':' + values.uri).toString('base64');
            next(null, values);

        }
    ],

    /**
     * Attach default Role to a new User
     */
    afterCreate: [
        function AfterCreateGrantPermissions (route, next){
            sails.log.silly('Route.AfterCreateGrantPermissions.route', route);
            Promise.bind({ }, Role.find()
                .then(function (roles) {
                    this.roles = roles;
                    this.permissions = [];

                    //Make sure the roles have been created first
                    if(this.roles.length > 0){
                        var adminRole = _.find(this.roles, { name: 'admin' });

                        this.permissions.push({
                            route: route.id,
                            action: route.method,
                            role: adminRole.id,
                            createdBy: route.createdBy  
                        });

                        _.remove(this.roles, {
                            id: adminRole.id
                        });

                        _.each(this.roles, function(role){
                          if(typeof route.defaultPermissions !== 'undefined' && route.defaultPermissions.indexOf(role.name) > -1){

                            this.permissions.push({
                              route: route.id,
                              action: route.method,
                              role: role.id,
                              createdBy: route.createdBy
                            });

                          }
                        });
                    }
                    return Promise.all(
                        _.map(this.permissions, function (permission) {
                            return Permission.findOrCreate(permission, permission); 
                        })
                    );
                })
                .then(function (permissions){
                    sails.log.silly('Route.AfterCreateGrantPermissions.permissions', permissions);
                    return next();
                })
                .catch(function(e) {
                    sails.log.error(e);
                    next(e);
                })

            );
        }
    ]


}