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
	    	type: 'string'
	    },

	    //The type of setting eg. string, json, array, boolean
	    type: {
	    	type: 'string'
	    },

	    //The description of the settting
	    description: {
	    	type: 'string'
	    },

	    //The displayed title of the setting
	    title: {
	    	type: 'string'
	    },

	    /**
         * If this setting is secure, it can not be displayed to the frontend
         */
	    secure: {
	    	type: 'boolean',
	    	defaultsTo: false
	    }
	},

	afterCreate: [
		function saveSetting(setting, next){
			sails.log.silly('Setting.afterCreate.saveSetting',setting);
			sails.config.humpback.settings[setting.name] = setting.setting;

			next();
		}
	],
	afterUpdate: [
		function saveSetting(setting, next){
			sails.log.silly('Setting.afterUpdate.saveSetting',setting);
			sails.config.humpback.settings[setting.name] = setting.setting;

			next();
		}
	],
	afterDestroy: [
		function removeSetting(setting, next){
			sails.log.silly('Setting.afterCreate.removeSetting',setting);
			delete sails.config.humpback.settings[setting.name];

			next();
		}
	]


};
