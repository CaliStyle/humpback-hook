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
function _abstractVerb(address){
  var verb, crud = ['get','post','put','delete'];
  if (_.isString(address)){
    address = address.toLowerCase().split(' ')[0];
    verb = crud.indexOf(address) > -1 ? crud[crud.indexOf(address)] : 'get';
  }

  return verb;
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

  reserved: true,

  //Global Permissions override all local permissions
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
     * base encoded verb:URI of this route
     */
    id: {
        type: 'string',
        primaryKey: true,
        required: true
        //,index: true
    },

    /**
     * The Ordering of routes
     */
    order: {
      type: 'integer'
    },
    /**
     * the URI of this route
     */
    uri: {
        type: 'string'
    },

    /**
     * 'GET /foo/bar': 'FooController.bar'
     * ^^^^address^^^^
     */
		address: {
			type: 'string',
			required: true
      //,index: true
		},

    /**
     * 'GET /foo/bar': 'FooController.bar'
     *                 ^^^^^^target^^^^^^^
     */
    target: {
      type: 'json'
      //,required: true,
      //index: true
    },

    /**
     * Verb (method) used to call the controller
     */
    verb: {
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
        type: 'string'
        //,index: true,
        //notNull: true
    },

		/**
     * the controller action to apply policy too
     */
		action: {
			type: 'string'
      //,index: true
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

    //On authorization failure, where does this route redirect?
    redirect: {
      type: 'text'
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
          values.verb = _abstractVerb(values.address);
      }

      next(null, values);
    },
    /**
     * Create the ID;
     */
    function RouteBeforeValidateCreateId (values, next){

      values.id = new Buffer(values.verb + ':' + values.uri).toString('base64');
      next(null, values);

    }
  ],

  /**
   * Attach Roles to a new Route
   */
  afterCreate: [
    function AfterCreateGrantPermissions (route, next){
      sails.log.verbose('Route.AfterCreateGrantPermissions.route', route);
      Role.find()
        .then(function (roles) {
          this.roles = roles;
          this.permissions = [];

          //Make sure the roles have been created first
          if(this.roles.length > 0){
              var adminRole = _.find(this.roles, { name: 'admin' });

              this.permissions.push({
                  route: route.id,
                  action: route.verb,
                  role: adminRole.id
              });

              _.remove(this.roles, {
                  id: adminRole.id
              });

              _.each(this.roles, function(role){
                if(typeof route.defaultPermissions !== 'undefined' && route.defaultPermissions.indexOf(role.name) > -1){

                  this.permissions.push({
                    route: route.id,
                    action: route.verb,
                    role: role.id,
                    owner: route.owner
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
            sails.log.verbose('Route.AfterCreateGrantPermissions.permissions', permissions);
            next();
            return null;
        })
        .catch(function(e) {
            sails.log.error(e);
            next(e);
            return null;
        });
    },

    function AfterCreateUpdateCache (route, next){
      Route.findOne(route.id)
      .populate('roles')
      .then(function(route){
        sails.config._routeCache[route.id] = route;
        sails.log.verbose('Route.AfterCreateUpdateCache', route);

        next();
        return null;
      });
    }
  ],

  afterUpdate: [
    function AfterUpdateCache(route, next){
      Route.findOne(route.id)
      .populate('roles')
      .then(function(route){
        sails.config._routeCache[route.id] = route;
        sails.log.verbose('Route.AfterUpdateCache.route', route);
        next();
        return null;
      });
    }
  ]
}
