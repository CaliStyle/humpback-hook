/**
* Setting.js
*
* @description 		:: Setting Contains the settings for the Humpback Application
* @humpback-docs	:: https://github.com/CaliStyle/humpback/wiki/Models#setting
* @sails-docs		:: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	description: 'Represents a humpback setting.',

	autoCreatedBy: true,

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
         * The Name of the Setting (this becomes the index in config.humpback.settings)
         */
		name: {
	    	type: 'string',
	    	required: true,
	    	unique: true
	    },

	    /**
         * The values of the setting
         */
	    setting: {
	    	type: 'json'
	    },

	    /**
         * If this setting is secure, it can not be displayed to the frontend
         */
	    secure: {
	    	type: 'boolean',
	    	defaults: false
	    }
	}
};
