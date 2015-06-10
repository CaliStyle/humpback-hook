'use strict';

//dependencies
//var path = require('path');
//var libPath = path.join(__dirname, 'lib');
var _ = require('lodash');
var Passport = require('passport').constructor;
var http = require('http');

module.exports = function (sails) {
 	return { 
 		defaults: {
      passport: {
        // Default to look for a model w/ identity 'user'
        userModelIdentity: 'user',
        methods : ['login', 'logIn', 'logout', 'logOut', 'isAuthenticated', 'isUnauthenticated']
      }
    },
		configure: function () {
      
      if (!_.isObject(sails.config.humpback)){
      	sails.config.humpback = { };
      }
     
    },
		initialize: function (next) {
			var err, eventsToWaitFor = [];


			// Validate `userModelIdentity` config
      if (typeof sails.config.passport.userModelIdentity !== 'string') {
        sails.config.passport.userModelIdentity = 'user';
      }
      sails.config.passport.userModelIdentity = sails.config.passport.userModelIdentity.toLowerCase();

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


			//apply validation hook
      sails.after(eventsToWaitFor, function() {
        
        // Look up configured user model
        var UserModel = sails.models[sails.config.passport.userModelIdentity];

        //bind custom errors logic
        if (!UserModel) {
          err = new Error();
          err.code = 'E_HOOK_INITIALIZE';
          err.name = 'Humpback Hook Error';
          err.message = 'Could not load the humpback hook because `sails.config.passport.userModelIdentity` refers to an unknown model: "'+sails.config.passport.userModelIdentity+'".';
          if (sails.config.passport.userModelIdentity === 'user') {
            err.message += '\nThis option defaults to `user` if unspecified or invalid- maybe you need to set or correct it?';
          }
          return next(err);
        }

        // Create a passport instance to use
        sails.passport = new Passport();

        // Teach our Passport how to serialize/dehydrate a user object into an id
        sails.passport.serializeUser(function(user, done) {
          console.log('Using primary key', UserModel.primaryKey, 'with record:',user);
          done(null, user[UserModel.primaryKey]);
        });

        // Teach our Passport how to deserialize/hydrate an id back into a user object
        sails.passport.deserializeUser(function(id, done) {
          UserModel.findOne(id, function(err, user) {
            done(err, user);
          });
        });

        // It's very important to trigger this callback method when you are finished
        // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
        next();

      });
		},

		//intercent all request and bundle passport onto it
    routes: {
      before: {
        'all /*': function grab(req, res, next) {
     			//req = _extendReq(req);
          sails.passport.initialize()(req,res,function(err){
            if (err) {
            	return res.negotiate(err);
            }

            sails.passport.session()(req,res, function (err){
              if (err){
              	return res.negotiate(err);
              }

              // Make the request's passport methods available for socket
				      if (req.isSocket) {
				        for (var i = 0; i < sails.config.passport.methods.length; i++) {
				          req[sails.config.passport.methods[i]] = http.IncomingMessage.prototype[sails.config.passport.methods[i]].bind(req);
				        }
				      }
				      // Make the user available throughout the frontend
				      res.locals.user = req.user;

              //continue
              next();
            });
          });
        }
      }
    }
	};
};