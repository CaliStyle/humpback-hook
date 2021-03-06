/**
* Model.js
*
* @description    :: Represents a Waterline collection that a User can preform CRUD, query, etc.
* @humpback-docs  :: https://github.com/CaliStyle/humpback/wiki/Models#model
* @sails-docs     :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
    description: 'Represents a Waterline collection that a User can preform CRUD, query, etc.',

    autoPK: true,
  
    autoCreatedBy: false,
  
    autoCreatedAt: true,
  
    autoUpdatedAt: true,

    reserved: true,
    
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
         * 
         */
        name: {
            type: 'string',
            notNull: true,
            unique: true
        },

        /**
         * 
         */
        identity: {
            type: 'string',
            notNull: true
        },

        /**
         * 
         */
        private: {
            type: 'boolean'
        },

        /**
         * 
         */
        description: {
            type: 'string'
        },

        /**
         * 
         */
        attributes: {
            type: 'json'
        },

        /**
         * 
         */
        permissions: {
            //collection: 'Permission',
            //via: 'model'
            type: 'json'
        }
    }
};
