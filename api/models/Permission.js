/**
* Permission.js
*
* @description    :: The actions a Role is granted on a particular Model and its attributes
* @humpback-docs  :: https://github.com/CaliStyle/humpback/wiki/Models#permission
* @sails-docs     :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  
    autoCreatedBy: false,

    description: [
        'Defines a particular `action` that a `Role` can perform on a `Model`.',
        'A `User` can perform an `action` on a `Model` by having a `Role` which',
        'grants the necessary `Permission`.'
    ].join(' '),

    //Global Permissions override all local permissions
    permissions: {
        'registered': {
            'create': {action: false, relation: false},
            'read'  : {action: true,  relation: false},
            'update': {action: false, relation: false},
            'delete': {action: false, relation: false}    
        },
        'public': {
            'create': {action: false, relation: false},
            'read'  : {action: true,  relation: false},
            'update': {action: false, relation: false},
            'delete': {action: false, relation: false}
        }
    },

    attributes: {

        /**
         * The Model that this Permission applies to.
         */
        model: {
            model: 'Model'
            //,required: true
        },

        /**
         * The Route that this Permission applies to.
         */
        route: {
            model: 'Route'
            //,required: true
        },

        /**
         * id of particular object/record (of type 'model') that this Permission
         * applies to.
         *
         * TODO dormant. enable in future release
         */
        object: {
            type: 'integer',
            defaultsTo: -1
            //,index: true
        },

        /**
         * If permission describes a Model,
         * attributes of model that this Permission governs.
         *
         * '*' wildcard is allowed and the default, 
         * else only access to specified attributes
         */
        attributes: {
            type: 'array',
            defaultsTo: ['*']
            //,index: true
        },

        /**
         * action permissions based on all controller
         * actions, including custom ones
         * this is also used for the Route Method (Verb)
         */
        action: {
            type: 'string',
            //index: true,
            notNull: true
          
          /**
           * TODO remove enum and support permissions based on all controller
           * actions, including custom ones
           */
          /*
          enum: [
            'create',
            'read',
            'update',
            'delete'
          ]
          */
        },

        relation: {
            type: 'string',
            enum: [
                'role',
                'owner',
                'user'
            ],
            defaultsTo: 'role'
            //,index: true
        },

        /**
         * The Role to which this Permission grants create, read, update, and/or
         * delete privileges.
         */
        role: {
            model: 'Role',
            required: true
        },
        
        /**
         * The User to which this Permission grants create, read, update, and/or
         * delete privileges.
         */
        user: {
          model: 'User'
          // Validate manually
        },

        /**
         * A list of criteria.  If any of the criteria match the request, the action is allowed.
         * If no criteria are specified, it is ignored altogether.
         */
        criteria: {
            collection: 'Criteria',
            via: 'permission'
        }
    },

    afterValidate: [
        function validateOwnerCreateTautology (permission, next) {
          if (permission.relation == 'owner' && permission.action == 'create') {
            next(new Error('Creating a Permission with relation=owner and action=create is tautological'));
          }

          if (permission.action === 'delete' &&
                  _.filter(permission.criteria, function (criteria) { return !_.isEmpty(criteria.blacklist); }).length) {
            next(new Error('Creating a Permission with an attribute blacklist is not allowed when action=delete'));
          }

          if (permission.relation == 'user' && permission.user === "") {
            next(new Error('A Permission with relation user MUST have the user attribute set'));
          }

          if (permission.relation == 'role' && permission.role === "") {
            next(new Error('A Permission with relation role MUST have the role attribute set'));
          }

          next();
        }
    ]
};