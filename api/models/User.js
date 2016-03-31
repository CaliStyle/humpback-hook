/**
* User.js
*
* @description    :: TODO: You might write a short summary of how this model works and what it represents here.
* @humpback-docs  :: https://github.com/CaliStyle/humpback/wiki/Models#user
* @sails-docs     :: http://sailsjs.org/#!documentation/models
*/


var _ = require('lodash');
var crypto = require('crypto');

String.prototype.replaceArray = function(find, replace, ignore) {
    var replaceString = this;
    for (var i = 0; i < find.length; i++) {
        replaceString = replaceString.replace(new RegExp(find[i].replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(replace[i])=="string")?replace[i].replace(/\$/g,"$$$$"):replace[i]);
    }
    return replaceString;
};


module.exports = {

    description: 'Represents a User.',

    reserved: true,

    //Global Permissions override all local permissions
    permissions: {
        'registered': {
            'create': {action: false, relation: false},
            'read'  : {action: true,  relation: false},
            'update': {action: true, relation: 'owner'},
            'delete': {action: false, relation: false}
        },
        'public': {
            'create': {action: false, relation: false},
            'read'  : {action: false, relation: false},
            'update': {action: false, relation: false},
            'delete': {action: false, relation: false}
        }
    },

    attributes: {
        /**
         *
         */
        username: {
            type: 'string',
            unique: true,
            required: true, // We need some kind of unique identifier, since not all providers have a email, this is the way to go.
            //index: true, //Waterline can not index a String as v0.10.0
            //notNull: true
        },

        /**
         *
         */
        email: {
            type: 'email',
            unique: true,
            //required: true, //Not all providers return an email, here's looking at you twitter!
            //index: true, //Waterline can not index a String as v0.10.0
            //notNull: true //Not all providers return an email, here's looking at you twitter!
        },

        /**
         *
         */
        passports: {
            collection: 'Passport',
            via: 'user'
        },

        /**
         *
         */
        roles: {
            collection: 'Role',
            via: 'users',
            dominant: true
        },

        /**
         *
         */
        getGravatarUrl: function () {
            if(this.email){
                var md5 = crypto.createHash('md5');
                md5.update(this.email);
                return 'https://gravatar.com/avatar/'+ md5.digest('hex');
            }else{
                return null;
            }
        },

        /**
         *
         */
        toJSON: function () {
            var user = this.toObject();
            delete user.password;
            user.gravatarUrl = this.getGravatarUrl();
            return user;
        }
    },

    /**
     * Callback to be run before validating a User.
     *
     * @param {Object}   values, the values for the user
     * @param {Function} next
     */
    beforeValidate: [

        function setUsername(values, next){
            sails.log.silly('User.beforeValidate.setUsername', values);

            if(values.email && !values.username){
                var username,
                find = [".", "@"],
                replace = ["DOT", "AT"];

                username = values.email.replaceArray(find, replace);
                values.username = username;
            }
            next(null, values);
        }
    ],

    afterValidate: [
        function updatePassword(values, next) {
      // Update the passport password if it was passed in
      if (values.password && values.id) {
        Passport
          .findOne({user: values.id, protocol: 'local'})
          .then(function (rec) {
            if (!rec) {
              return Passport.create({
                user: values.id,
                protocol: 'local',
                password: values.password
              });
            }
            return Passport
              .update({user: values.id, protocol: 'local'}, {password: values.password});
          })
          .then(function (passport) {
              delete values.password;
              next();
          })
          .catch(function (err) {
            next(err);
          });
      }
      else {
        next();
      }
    }
    ],

    /**
     * Callback to be run before creating a User.
     *
     * @param {Object}   user, the soon to be created user
     * @param {Function} next
     */
    beforeCreate: [
        function UserBeforeCreate(values, next){
            next();
        }
    ],

    /**
     * Attach default Role to a new User
     */
    afterCreate: [
        /**
         * Callback to be run after creating a User.
         *
         * @param {Object}   user, the created user
         * @param {Function} next
         */
        function setOwner (user, next) {
            sails.log.silly('User.afterCreate.setOwner', user);
            User.update({ id: user.id }, { owner: user.id })
                .then(function (user) {
                next();
            })
            .catch(function (e) {
                sails.log.error(e);
                next(e);
            });
        },

        /**
         * Callback to be run after creating a User.
         *
         * @param {Object}   user, the created user
         * @param {Function} next
         */
        function attachDefaultRole (user, next) {
            sails.log.silly('User.attachDefaultRole', user);
            Promise.bind({ }, User.findOne(user.id)
                .populate('roles')
                .then(function (user) {
                    this.user = user;
                    return Role.findOne({ name: 'registered' });
                })
                .then(function (role) {

                    var registered = _.some(this.user.roles, function (userRole) {
                        return userRole.id === role.id;
                    });

                    if(!registered){
                        this.user.roles.add(role.id);
                    }
                    return this.user.save();
                })
                .then(function () {
                    sails.log.silly('role "registered" attached to user', this.user.username);
                    next();
                })
                .catch(function (e) {
                  sails.log.error(e);
                  next(e);
                })
            );
        }
    ],

    /**
     * Backend Method to create a user
     *
     * @param {Object}   user, the user to be registered
     */
    register: function (user) {
        return new Promise(function (resolve, reject) {
            sails.passport.protocols.local.createUser(user, function (error, created) {
            if (error) {
                return reject(error);
            }

            resolve(created);
            });
        });
    }
}
