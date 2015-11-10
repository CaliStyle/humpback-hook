'use strict';

//dependencies
var _ = require('lodash');
var Passport = require('passport').constructor;
var path = require('path');
var url = require('url');
var fnv = require('fnv-plus');
var noop = function() {};

/*
var _policies = {

  '*': [
    'ModelPolicy',
    'AuditPolicy',
    'OwnerPolicy',
    'PermissionPolicy',
    'RolePolicy',
    'CriteriaPolicy',
    'RoutePolicy'
  ],
  AuthController: {
    '*': []
  }  
};
*/

var _settings = [
  { 
    name: 'google.analytics',
    setting: '',
    type: 'string',
    description: 'The Google Analytics Property Id for the Web Application',
    title: 'Google Analytics Id'
  },
  { 
    name: 'test.secure',
    setting: '{"test": "test"}',
    type: 'json',
    description: 'Test Secure',
    title: 'Test Secure',
    secure: true
  }
];
//var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
//var wlFilter = require('waterline-criteria');


/**
 * Normally these methods are added to the global HTTP IncomingMessage
 * prototype, which breaks encapsulation of Passport core.
 * This function is a patch to override this and also attach them to the local req/res.
 * This allows these methods to work for incoming socket requests.
 * @param  {[type]} req [description]
 * @return {[type]}     [description]
 */
function _extendReq(req) {

  /**
   * Intiate a login session for `user`.
   *
   * Options:
   *   - `session`  Save login state in session, defaults to _true_
   *
   * Examples:
   *
   *     req.logIn(user, { session: false });
   *
   *     req.logIn(user, function(err) {
   *       if (err) { throw err; }
   *       // session saved
   *     });
   *
   * @param {User} user
   * @param {Object} options
   * @param {Function} done
   * @api public
   */
  req.login = req.logIn = function(user, options, done) {
    var property, session;
    
    if (typeof options === 'function') {
      done = options;
      options = {};
    }
    options = options || {};

    property = 'user';
    if (req._passport && req._passport.instance) {
      property = req._passport.instance._userProperty || 'user';
    }
    session = (options.session === undefined) ? true : options.session;

    req[property] = user;
    if (!session) {
    	return done && done();
    }
    if (!req._passport) { 
    	throw new Error('passport.initialize() middleware not in use'); 
    }
    if (typeof done !== 'function') { 
    	throw new Error('req#login requires a callback function'); 
    }

    req._passport.instance.serializeUser(user, req, function(err, obj) {
      if (err) {
        req[property] = null;
        return done(err);
      }
      req._passport.session.user = obj;
      done();
    });
  };

  /**
   * Terminate an existing login session.
   *
   * @api public
   */
  req.logout = req.logOut = function() {
    var property = 'user';
    if (req._passport && req._passport.instance) {
      property = req._passport.instance._userProperty || 'user';
    }

    req[property] = null;
    if (req._passport && req._passport.session) {
      delete req._passport.session.user;
    }
  };

  /**
   * Test if request is authenticated.
   *
   * @return {Boolean}
   * @api public
   */
  req.isAuthenticated = function() {
    var property = 'user';
    if (req._passport && req._passport.instance) {
      property = req._passport.instance._userProperty || 'user';
    }

    return (req[property]) ? true : false;
  };

  /**
   * Test if request is unauthenticated.
   *
   * @return {Boolean}
   * @api public
   */
  req.isUnauthenticated = function() {
    return !req.isAuthenticated();
  };

  /**
   * Get the IP address
   *
   * @return IP address
   * @api public
   */

  var ipAddress = req.isSocket ? req.socket.handshake.address : req.headers['x-forwarded-for'] || (req.connection && req.connection.remoteAddress);
  req.ipAddress = ipAddress;

  /**
   * Hashed unique id
   *
   * @return Hash
   * @api public
   */
  req.requestId = fnv.hash(new Date().valueOf() + ipAddress, 128).str();

  return req;
}

/**
 * Initiate Model Ownership
 * private
 */

function _installModelOwnership (models) {
  _.each(models, function (model) {
    if (model.autoCreatedBy === false){
    	return;
    }

    _.defaults(model.attributes, {
      createdBy: {
        model: 'User',
        index: true,
        notNull: true
      },
      owner: {
        model: 'User',
        index: true
      }
    });
  });
}

/**
 * Install the application. Sets up default Roles, Users, Models, and
 * Permissions, and creates an admin user.
 * private
 */
function _initializeFixtures () {
  return require('./lib/permissions/model').createModels()
    .bind({ })
    .then(function (models) {
      
    	if(models.length === 0){
    		var err = new Error();
		    err.code = 'E_HOOK_INITIALIZE';
		    err.name = 'Humpback Hook Error';
		    err.message = 'humpback-hook: failed to create models';
		    return err;
    	}
      
      sails.config._modelCache = _.indexBy(models, 'identity');

      this.models = models;
      return require('./lib/permissions/role').create();
    })
    .then(function (roles) {
      this.roles = roles;
      var userModel = _.find(this.models, { name: 'User' });
      return require('./lib/permissions/user').create(this.roles, userModel);
    })
    .then(function () {
    	var User = sails.models[sails.config.humpback.userModelIdentity];
      return User.findOne({ username: sails.config.humpback.adminUsername });
    })
    .then(function (user) {
    	if(!user){
    		var err = new Error();
		    err.code = 'E_HOOK_INITIALIZE';
		    err.name = 'Humpback Hook Error';
		    err.message = 'humpback-hook: failed to create admin';
		    return err;
    	}
      
      user.createdBy = user.id;
      user.owner = user.id;
      return user.save();
    })
    .then(function (admin) {
      sails.log.silly('humpback-hook: admin user:', admin);
      this.admin = admin;

      return require('./lib/permissions/route').createRoutes(this.roles, this.models, this.admin);
    })
    .then(function (routes){
      sails.log.silly('humpback-hook: routes', routes);
      
      sails.config._routeCache = _.indexBy(routes, 'id');

      this.routes = routes;

      return require('./lib/permissions/permission').create(this.roles, this.models, this.routes, this.admin);
    })
    .then(function (permissions) {
      this.permissions = permissions;
      return permissions;
    })
    .catch(function (err) {
      sails.log.error(err);
    });
}

/**
 * Get All Settings from Database and set them in the humpback config.
 * private
 */
function _initializeSettings () {
  return require('./lib/settings/core').syncSettings()
    .bind({ })
    .then(function (settings) {
      return settings;
    })
    .catch(function (err) {
      sails.log.error(err);
    });
}

/**
 * 
 * 
 */

module.exports = function (sails) {
 	return { 
    
    
 		
    defaults: {

      // Defaults to look for a model w/ identity
      humpback: {
      	userModelIdentity: 'user',
      	settingModelIdentity: 'setting',
      	adminUsername: process.env.ADMIN_USERNAME || 'admin',
				adminPassword: process.env.ADMIN_PASSWORD || 'admin123'
      },
      // Defaults to look for a model w/ identity
      permission: {
      	passportModelIdentity: 'passport',
        modelModelIdentity: 'model',
        permissionModelIdentity: 'permission',
        roleModelIdentity: 'role',
        requestlogModelIdentity: 'requestlog',
        routeModelIdentity: 'route'
      },

      //humpback-hook added routes
      //Admins have permissions to all routes by default,
      //If no defaultPermissions are set, they are considered public  
      routes : {
        'post /register': { 
          controller: 'UserController', 
          action: 'register'
        },
        'post /logout': {
          controller: 'AuthController', 
          action: 'logout',
          defaultRoles: ['registered']
        },
        'get /logout': {
          controller: 'AuthController', 
          action: 'logout',
          defaultRoles: ['registered']
        },
        'post /auth/local': {
          controller: 'AuthController',
          action: 'callback'
        },
        'post /auth/local/:action': {
          controller: 'AuthController', 
          action: 'callback'
        },
        'get /auth/:provider': {
          controller: 'AuthController', 
          action: 'provider'
        },
        'get /auth/:provider/callback': {
          controller: 'AuthController', 
          action: 'callback'
        },
        'get /auth/:provider/:action': {
          controller: 'AuthController', 
          action: 'callback'
        },
        'get /ping': {
          controller: 'AuthController', 
          action: 'ping'
        }
      },
      //humpback-hook added model definitions, can be overriden per model
      models: {

        autoCreatedBy: true,
        dynamicFinders: false,
        reserved: false,
        private: false,

        /**
         * [updateOrCreate description]
         * @param  {[type]}   criteria [description]
         * @param  {[type]}   values   [description]
         * @param  {Function} cb       [description]
         * @return {[type]}            [description]
        */
        updateOrCreate: function (criteria, values, cb) {

          var normalize = require('sails/node_modules/waterline/lib/waterline/utils/normalize');
          var _hasOwnProperty = require('sails/node_modules/waterline/lib/waterline/utils/helpers').object.hasOwnProperty;
          var defer = require('sails/node_modules/waterline/lib/waterline/utils/defer');

          var self = this; 
          var deferred;

          // Normalize Arguments
          if(typeof cb !== 'function') {
             deferred = defer();
          }
          cb = cb || noop;
          
          criteria = normalize.criteria(criteria);

          if (criteria === false) {
            if(deferred) {
                deferred.resolve(null);
            }
            return cb(null, []);
          }
          else if(!criteria) {
            if(deferred) {
                deferred.reject(new Error('No criteria or id specified!'));
            }
            return cb(new Error('No criteria or id specified!'));
          }

          // Build Default Error Message
          var errFind = 'No find() method defined in adapter!';
          var errUpdate = 'No update() method defined in adapter!';
          var errCreate = 'No create() method defined in adapter!';

          // Find the connection to run this on
          if(!_hasOwnProperty(self.adapter.dictionary, 'find')){
            if(deferred) {
                deferred.reject(errFind);
              }
            return cb(new Error(errFind));
          }
          if(!_hasOwnProperty(self.adapter.dictionary, 'update')){ 
            if(deferred) {
                deferred.reject(errUpdate);
              }
            return cb(new Error(errUpdate));
          }
          if(!_hasOwnProperty(self.adapter.dictionary, 'create')) {
            if(deferred) {
                  deferred.reject(errCreate);
              }
            return cb(new Error(errCreate));
          }

          var connNameFind = self.adapter.dictionary.find;
          var adapterFind = self.adapter.connections[connNameFind]._adapter;
          
          var connNameUpdate = self.adapter.dictionary.update;
          var adapterUpdate = self.adapter.connections[connNameUpdate]._adapter;

          var connNameCreate = self.adapter.dictionary.create;
          var adapterCreate = self.adapter.connections[connNameCreate]._adapter;

          adapterFind.find(connNameFind, self.adapter.collection, criteria, normalize.callback(function before (err, results){
            
            if (err) {
              if(deferred) {
                deferred.reject(err);
              }
              return cb(err);
            }

            if(results && results.length > 0){
              adapterUpdate.update(connNameUpdate, self.adapter.collection, criteria, values, normalize.callback(function afterwards (err, updatedRecords) {
                if (err) {
                  if(deferred) {
                      deferred.reject(err);
                  }
                  return cb(err);
                }
                deferred.resolve(updatedRecords[0]);
                return cb(null, updatedRecords[0]);
              }));
            }else{
              adapterCreate.create(connNameCreate, self.adapter.collection, values, normalize.callback(function afterwards (err, createdRecord) {
                if (err) {
                  if(deferred) {
                      deferred.reject(err);
                  }
                  return cb(err);
                }
                deferred.resolve(createdRecord);
                return cb(null, createdRecord);
              }));
            }
          }));
            
          if(deferred) {
            return deferred.promise;
          }
        }
      }
    },

		configure: function () {
      
      if (!_.isObject(sails.config.humpback)){
      	sails.config.humpback = { };
      }

      if(!_.isObject(sails.config.humpback.barnacles)){
        sails.config.humpback.barnacles = { };
      }
      sails.config.humpback.barnacles.core = true;

      if (!_.isArray(sails.config.humpback.settings)){
        sails.config.humpback.settings = [];
      }
      sails.config.humpback.settings = _.extend(sails.config.humpback.settings, _settings);

      if (!_.isObject(sails.config.humpback.secure)){
        sails.config.humpback.secure = { };
      }

      if (!_.isObject(sails.config.humpback.notsecure)){
        sails.config.humpback.notsecure = { };
      }

      if (!_.isObject(sails.config._modelCache)){
        sails.config._modelCache = { };
      }

      if (!_.isObject(sails.config._routeCache)){
        sails.config._routeCache = { };
      }

      if (!_.isObject(sails.config._foundationRoutes)){
        sails.config._foundationRoutes = { };
      }

      /*
      if (!_.isObject(sails.config.policies)){
        sails.config.policies = { };
      }
      
      sails.config.policies = _.merge(sails.config.policies, _policies);
      */

      sails.config.blueprints.populate = false;


      //create globals
      global.Promise = require('bluebird');
      global._ = require('lodash');
      _.mixin(require('congruence'));
      //global.PermissionService = require('./lib/services/permission');

      //this.models = models;
     
    },
		initialize: function (next) {
			var err, eventsToWaitFor = [];

			// Validate `userModelIdentity` config
      if (typeof sails.config.humpback.userModelIdentity !== 'string') {
        sails.config.humpback.userModelIdentity = 'user';
      }
      sails.config.humpback.userModelIdentity = sails.config.humpback.userModelIdentity.toLowerCase();

      //wait for orm hook to be loaded
      if (sails.hooks.orm) {
        eventsToWaitFor.push('hook:orm:loaded');
      }else{
      	err = new Error();
        err.code = 'E_HOOK_INITIALIZE';
        err.name = 'Humpback Hook Error';
        err.message = 'The "humpback" hook depends on the "orm" hook- cannot load the "humpback" hook without it!';
        return next(err);
      }

      /*
      //wait for pub sub hook to be loaded
      if (sails.hooks.pubsub) {
        eventsToWaitFor.push('hook:pubsub:loaded');
      }else{
      	err = new Error();
        err.code = 'E_HOOK_INITIALIZE';
        err.name = 'Humpback Hook Error';
        err.message = 'The "humpback" hook depends on the "pubsub" hook- cannot load the "humpback" hook without it!';
        return next(err);
      }

      //wait for policies hook to be loaded
      
      if (sails.hooks.policies) {
        eventsToWaitFor.push('hook:policies:bound');
      }else{
        err = new Error();
        err.code = 'E_HOOK_INITIALIZE';
        err.name = 'Humpback Hook Error';
        err.message = 'The "humpback" hook depends on the "policies" hook- cannot load the "humpback" hook without it!';
        return next(err);
      }
      */
      
      //wait for router to be loaded
      /*
      if (sails.router) {
        eventsToWaitFor.push('router:after');
      }else{
        err = new Error();
        err.code = 'E_HOOK_INITIALIZE';
        err.name = 'Humpback Hook Error';
        err.message = 'The "humpback" hook depends on the "router" - cannot load the "humpback" hook without it!';
        return next(err);
      }
      */
      //wait for controllers to be loaded
      /*
      if (sails.hooks.controllers) {
        eventsToWaitFor.push('hook:controllers:loaded');
      }else{
        err = new Error();
        err.code = 'E_HOOK_INITIALIZE';
        err.name = 'Humpback Hook Error';
        err.message = 'The "humpback" hook depends on the "controllers" - cannot load the "humpback" hook without it!';
        return next(err);
      }
      */

			//apply validation hook
      sails.after(eventsToWaitFor, function() {
        
        // Look up configured user model
        var UserModel = sails.models[sails.config.humpback.userModelIdentity],
        		SettingModel = sails.models[sails.config.humpback.settingModelIdentity],
       			PassportModel = sails.models[sails.config.permission.passportModelIdentity],
       			ModelModel = sails.models[sails.config.permission.modelModelIdentity],
       			PermissionModel = sails.models[sails.config.permission.permissionModelIdentity],
       			RoleModel = sails.models[sails.config.permission.roleModelIdentity],
            RequestLogModel = sails.models[sails.config.permission.requestlogModelIdentity],
            RouteModel = sails.models[sails.config.permission.routeModelIdentity];
        		
        //bind custom errors logic
        if (!UserModel) {
          err = new Error();
          err.code = 'E_HOOK_INITIALIZE';
          err.name = 'Humpback Hook Error';
          err.message = 'Could not load the humpback hook because `sails.config.humpback.userModelIdentity` refers to an unknown model: "'+sails.config.humpback.userModelIdentity+'".';
          if (sails.config.humpback.userModelIdentity === 'user') {
            err.message += '\nThis option defaults to `user` if unspecified or invalid- maybe you need to set or correct it?';
          }
          return next(err);
        }

        if (!PassportModel) {
          err = new Error();
          err.code = 'E_HOOK_INITIALIZE';
          err.name = 'Humpback Hook Error';
          err.message = 'Could not load the humpback hook because `sails.config.permission.passportModelIdentity` refers to an unknown model: "'+sails.config.permission.passportModelIdentity+'".';
          if (sails.config.permission.passportModelIdentity === 'passport') {
            err.message += '\nThis option defaults to `passport` if unspecified or invalid- maybe you need to set or correct it?';
          }
          return next(err);
        }

        if (!ModelModel) {
          err = new Error();
          err.code = 'E_HOOK_INITIALIZE';
          err.name = 'Humpback Hook Error';
          err.message = 'Could not load the humpback hook because `sails.config.permission.modelModelIdentity` refers to an unknown model: "'+sails.config.permission.modelModelIdentity+'".';
          if (sails.config.permission.modelModelIdentity === 'model') {
            err.message += '\nThis option defaults to `model` if unspecified or invalid- maybe you need to set or correct it?';
          }
          return next(err);
        }

        if (!PermissionModel) {
          err = new Error();
          err.code = 'E_HOOK_INITIALIZE';
          err.name = 'Humpback Hook Error';
          err.message = 'Could not load the humpback hook because `sails.config.permission.permissionModelIdentity` refers to an unknown model: "'+sails.config.permission.permissionModelIdentity+'".';
          if (sails.config.permission.permissionModelIdentity === 'permission') {
            err.message += '\nThis option defaults to `permission` if unspecified or invalid- maybe you need to set or correct it?';
          }
          return next(err);
        }

        if (!RoleModel) {
          err = new Error();
          err.code = 'E_HOOK_INITIALIZE';
          err.name = 'Humpback Hook Error';
          err.message = 'Could not load the humpback hook because `sails.config.permission.roleModelIdentity` refers to an unknown model: "'+sails.config.permission.roleModelIdentity+'".';
          if (sails.config.permission.roleModelIdentity === 'role') {
            err.message += '\nThis option defaults to `role` if unspecified or invalid- maybe you need to set or correct it?';
          }
          return next(err);
        }

        if (!SettingModel) {
          err = new Error();
          err.code = 'E_HOOK_INITIALIZE';
          err.name = 'Humpback Hook Error';
          err.message = 'Could not load the humpback hook because `sails.config.humpback.settingModelIdentity` refers to an unknown model: "'+sails.config.humpback.settingModelIdentity+'".';
          if (sails.config.humpback.settingModelIdentity === 'setting') {
            err.message += '\nThis option defaults to `setting` if unspecified or invalid- maybe you need to set or correct it?';
          }
          return next(err);
        }

        if (!RequestLogModel) {
          err = new Error();
          err.code = 'E_HOOK_INITIALIZE';
          err.name = 'Humpback Hook Error';
          err.message = 'Could not load the humpback hook because `sails.config.humpback.requestlogModelIdentity` refers to an unknown model: "'+sails.config.humpback.requestlogModelIdentity+'".';
          if (sails.config.humpback.requestlogModelIdentity === 'requestlog') {
            err.message += '\nThis option defaults to `requestlog` if unspecified or invalid- maybe you need to set or correct it?';
          }
          return next(err);
        }

        if (!RouteModel) {
          err = new Error();
          err.code = 'E_HOOK_INITIALIZE';
          err.name = 'Humpback Hook Error';
          err.message = 'Could not load the humpback hook because `sails.config.humpback.routeModelIdentity` refers to an unknown model: "'+sails.config.permission.routeModelIdentity+'".';
          if (sails.config.permission.routeModelIdentity === 'route') {
            err.message += '\nThis option defaults to `route` if unspecified or invalid- maybe you need to set or correct it?';
          }
          return next(err);
        }

        // Create a passport instance to use
        sails.passport = new Passport();

        // Load authentication protocols
				sails.passport.protocols = require('./lib/protocols');

				/**
				 * Connect a third-party profile to a local user
				 *
				 * This is where most of the magic happens when a user is authenticating with a
				 * third-party provider. What it does, is the following:
				 *
				 *   1. Given a provider and an identifier, find a mathcing Passport.
				 *   2. From here, the logic branches into two paths.
				 *
				 *     - A user is not currently logged in:
				 *       1. If a Passport wassn't found, create a new user as well as a new
				 *          Passport that will be assigned to the user.
				 *       2. If a Passport was found, get the user associated with the passport.
				 *
				 *     - A user is currently logged in:
				 *       1. If a Passport wasn't found, create a new Passport and associate it
				 *          with the already logged in user (ie. "Connect")
				 *       2. If a Passport was found, nothing needs to happen.
				 *
				 * As you can see, this function handles both "authentication" and "authori-
				 * zation" at the same time. This is due to the fact that we pass in
				 * `passReqToCallback: true` when loading the strategies, allowing us to look
				 * for an existing session in the request and taking action based on that.
				 *
				 * For more information on auth(entication|rization) in Passport.js, check out:
				 * http://passportjs.org/guide/authenticate/
				 * http://passportjs.org/guide/authorize/
				 *
				 * @param {Object}   req
				 * @param {Object}   query
				 * @param {Object}   profile
				 * @param {Function} next
				 */
				sails.passport.connect = function (req, query, profile, next) {
				  var user = { }, provider;

				  // Get the authentication provider from the query.
				  query.provider = req.param('provider');

				  // Use profile.provider or fallback to the query.provider if it is undefined
				  // as is the case for OpenID, for example
				  provider = profile.provider || query.provider;

				  // If the provider cannot be identified we cannot match it to a passport so
				  // throw an error and let whoever's next in line take care of it.
				  if (!provider){
				    return next(new Error('No authentication provider was identified.'));
				  }

				  // If the profile object contains a list of emails, grab the first one and
				  // add it to the user.
				  if (profile.hasOwnProperty('emails')) {
				    user.email = profile.emails[0].value;
				  }
				  // If the profile object contains a username, add it to the user.
				  if (profile.hasOwnProperty('username')) {
				    user.username = profile.username;
				  }

				  // If neither an email or a username was available in the profile, we don't
				  // have a way of identifying the user in the future. Throw an error and let
				  // whoever's next in the line take care of it.
				  if (!user.username && !user.email) {
				    return next(new Error('Neither a username nor email was available'));
				  }

				  PassportModel.findOne({
				    provider: provider,
				  	identifier : query.identifier.toString()
				  }, function (err, passport) {
				    if (err) {
				      return next(err);
				    }

				    if (!req.user) {
				      // Scenario: A new user is attempting to sign up using a third-party
				      //           authentication provider.
				      // Action:   Create a new user and assign them a passport.
				      if (!passport) {
				        sails.models.user.create(user, function (err, user) {
				          if (err) {
				            if (err.code === 'E_VALIDATION') {
				              if (err.invalidAttributes.email) {
				                req.flash('error', 'Error.Passport.Email.Exists');
				              }
				              else {
				                req.flash('error', 'Error.Passport.User.Exists');
				              }
				            }

				            return next(err);
				          }

				          query.user = user.id;

				          //PassportModel.create(query, function (err, passport) {
				          PassportModel.create(query, function (err) {
				            // If a passport wasn't created, bail out
				            if (err) {
				              return next(err);
				            }

				            next(err, user);
				          });
				        });
				      }
				      // Scenario: An existing user is trying to log in using an already
				      //           connected passport.
				      // Action:   Get the user associated with the passport.
				      else {
				        // If the tokens have changed since the last session, update them
				        if (query.hasOwnProperty('tokens') && query.tokens !== passport.tokens) {
				          passport.tokens = query.tokens;
				        }

				        // Save any updates to the Passport before moving on
				        passport.save(function (err, passport) {
				          if (err) {
				            return next(err);
				          }

				          // Fetch the user associated with the Passport
				          //sails.models.user.findOne(passport.user.id, next);
                  UserModel.findOne(passport.user.id, next);
				        });
				      }
				    } else {
				      // Scenario: A user is currently logged in and trying to connect a new
				      //           passport.
				      // Action:   Create and assign a new passport to the user.
				      if (!passport) {
				        query.user = req.user.id;

				        //Passport.create(query, function (err, passport) {
				        PassportModel.create(query, function (err) {
				          // If a passport wasn't created, bail out
				          if (err) {
				            return next(err);
				          }

				          next(err, req.user);
				        });
				      }
				      // Scenario: The user is a nutjob or spammed the back-button.
				      // Action:   Simply pass along the already established session.
				      else {
				        next(null, req.user);
				      }
				    }
				  });
				};

				/**
				 * Create an authentication endpoint
				 *
				 * For more information on authentication in Passport.js, check out:
				 * http://passportjs.org/guide/authenticate/
				 *
				 * @param  {Object} req
				 * @param  {Object} res
				 */
				sails.passport.endpoint = function (req, res) {
				  var strategies = sails.config.passport;
				  var provider = req.param('provider');
				  var options = { };

				  // If a provider doesn't exist for this endpoint, send the user back to the
				  // login page
				  if (!strategies.hasOwnProperty(provider)) {
				    var redirect = req.query.prev ? req.query.prev : '/login';
            return res.redirect(redirect);
				  }

				  // Attach scope if it has been set in the config
				  if (strategies[provider].hasOwnProperty('scope')) {
				    options.scope = strategies[provider].scope;
				  }

				  // Redirect the user to the provider for authentication. When complete,
				  // the provider will redirect the user back to the application at
				  //     /auth/:provider/callback
				  this.authenticate(provider, options)(req, res, req.next);
				};

				/**
				 * Create an authentication callback endpoint
				 *
				 * For more information on authentication in Passport.js, check out:
				 * http://passportjs.org/guide/authenticate/
				 *
				 * @param {Object}   req
				 * @param {Object}   res
				 * @param {Function} next
				 */
				sails.passport.callback = function (req, res, next) {
				  var provider = req.param('provider', 'local');
				  var action = req.param('action');

				  //console.log(this.protocols);
				  // Passport.js wasn't really built for local user registration, but it's nice
				  // having it tied into everything else.
				  if (provider === 'local' && action !== undefined) {
				    if (action === 'register' && !req.user) {
				      this.protocols.local.register(req, res, next);
				    }
				    else if (action === 'adminreset' && req.user) {
              this.protocols.local.adminreset(req, res, next);
            }
            else if (action === 'connect' && req.user) {
				      this.protocols.local.connect(req, res, next);
				    }
				    else if (action === 'disconnect' && req.user) {
				      this.protocols.local.disconnect(req, res, next);
				    }    
				    else {
				      next(new Error('Invalid action'));
				    }
				  } else {
				    if (action === 'disconnect' && req.user) {
				      this.disconnect(req, res, next) ;
				    } else {
				      // The provider will redirect the user to this URL after approval. Finish
				      // the authentication process by attempting to obtain an access token. If
				      // access was granted, the user will be logged in. Otherwise, authentication
				      // has failed.
				      this.authenticate(provider, next)(req, res, req.next);
				    }
				  }
				};

				/**
				 * Load all strategies defined in the Passport configuration
				 *
				 * For example, we could add this to our config to use the GitHub strategy
				 * with permission to access a users email address (even if it's marked as
				 * private) as well as permission to add and update a user's Gists:
				 *
				    github: {
				      name: 'GitHub',
				      protocol: 'oauth2',
				      scope: [ 'user', 'gist' ]
				      options: {
				        clientID: 'CLIENT_ID',
				        clientSecret: 'CLIENT_SECRET'
				      }
				    }
				 *
				 * For more information on the providers supported by Passport.js, check out:
				 * http://passportjs.org/guide/providers/
				 *
				 */
				sails.passport.loadStrategies = function () {
				  var self = this;
				  var strategies = sails.config.passport;

				  _.each(strategies, function(strategem, key){

				    var options = { passReqToCallback: true };
				    var Strategy;

				    if (key === 'local') {
				      // Since we need to allow users to login using both usernames as well as
				      // emails, we'll set the username field to something more generic.
				      _.extend(options, { usernameField: 'identifier' });

				      // Only load the local strategy if it's enabled in the config
				      if (strategies.local) {
				        Strategy = strategies[key].strategy;

				        self.use(new Strategy(options, self.protocols.local.login));
				      }
				    } else {
				      var protocol = strategies[key].protocol;
				      var callback = strategies[key].callback;

				      if (!callback) {
				        callback = path.join('auth', key, 'callback');
				      }

				      Strategy = strategies[key].strategy;

				      var baseUrl = sails.getBaseurl();

				      switch (protocol) {
				        case 'oauth':
				        case 'oauth2':
				          options.callbackURL = url.resolve(baseUrl, callback);
				          break;

				        case 'openid':
				          options.returnURL = url.resolve(baseUrl, callback);
				          options.realm     = baseUrl;
				          options.profile   = true;
				          break;
				      }

				      // Merge the default options with any options defined in the config. All
				      // defaults can be overriden, but I don't see a reason why you'd want to
				      // do that.
				      _.extend(options, strategies[key].options);

				      self.use(new Strategy(options, self.protocols[protocol]));
				    }
				  });
				};
 
        // Load passport strategies
        sails.passport.loadStrategies();

				/**
				 * Disconnect a passport from a user
				 *
				 * @param  {Object} req
				 * @param  {Object} res
				 */
				sails.passport.disconnect = function (req, res, next) {
				  var user = req.user;
				  var provider = req.param('provider');
				  var Passport = sails.models.passport;

				  Passport.findOne({
				      provider   : provider,
				      user       : user.id
				    }, function (err, passport) {
				      if (err) {
				      	return next(err);
				      }
				      Passport.destroy(passport.id, function passportDestroyed(err) {
				        if (err) {
				        	return next(err);
				        }
				        next(null, user);
				      });
				  });
				};

        // Teach our Passport how to serialize/dehydrate a user object into an id
        sails.passport.serializeUser(function(user, done) {
          sails.log('Using primary key', UserModel.primaryKey, 'with record:',user);
          done(null, user[UserModel.primaryKey]);
        });

        // Teach our Passport how to deserialize/hydrate an id back into a user object
        sails.passport.deserializeUser(function(id, done) {
          UserModel.findOne(id, function(err, user) {
            done(err, user);
          });
        });

        


				/**
				 * - Install Ownership Rights
				 * - Create Admin if nessecary	
				 */

				// Install Model Ownership rights
				_installModelOwnership(sails.models);

				Promise.bind({}, ModelModel.count()
          .then(function (count) {
            if (count === sails.models.length){ 
            	return;
            }

            return _initializeFixtures();
          })
          .then(function (initializedFixtures){
          	sails.log('humpback-hook: fixtures initialized', typeof initializedFixtures);
            return _initializeSettings();
          })
          .then(function (initializedSettings){
            sails.log('humpback-hook: settings initialized', typeof initializedSettings);
            sails.emit('hook:humpback:loaded');
            // It's very important to trigger this callback method when you are finished
            // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
            next();
          })
          .catch(function (error) {
            sails.log.error(error);
            next(error);
          })
        );

      });

		},

    /**
     * These route bindings act like policy abstractions
     * They occur before Blueprints and Custom Routes
     */
    routes: {
      before: {
        'all /*': [
          //intercept all request and bundle passport onto it
          function passport (req, res, next) {
       			
            //Extend the request with additional passport options and Request Entries
            req = _extendReq(req);

            // initialize passport on all routes for passport sockets
            sails.passport.initialize()(req,res,function(err){
              if (err) {
              	return res.negotiate(err);
              }

              sails.passport.session()(req,res, function (err){
                if (err) {
                	return res.negotiate(err);
                }
                
                //Move onto the next policies
                next();

              });
            });
          },
          
          // Remote Authorization from Header
          function allowRemoteAuthorization (req, res, next){
            var auth, authString, username, password;
            
            auth = req.headers.authorization;
            if (!auth || auth.search('Basic ') !== 0) {
              return next();
            }
            if (process.env.NODE_ENV === 'production' && !req.secure) {
              return res.status(403).json({ error: 'https required for basic auth. refusing login request' });
            }

            authString = new Buffer(auth.split(' ')[1], 'base64').toString();
            username = authString.split(':')[0];
            password = authString.split(':')[1];

            sails.log.silly('authenticating', username, 'using basic auth:', req.url);

            sails.passport.protocols.local.login(req, username, password, function (error, user, passport) {
              if (error) {
                return next(error);
              }
              if (!user) {
                req.session.authenticated = false;
                return res.status(403).json({ error: 'Could not authenticate user '+ username });
              }

              req.user = user;
              req.session.authenticated = true;
              req.session.passport = passport;

              //Move onto the next policies
              next();

            });
          },
        ]
      }
    }
	};
};

