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
			
			if(setting.secure){
				sails.config.humpback.secure[setting.name] = Setting.convertType(setting.type, setting.setting);
			}else{
				sails.config.humpback.notsecure[setting.name] = Setting.convertType(setting.type, setting.setting);
			}

			next();
		}
	],
	afterUpdate: [
		function saveSetting(setting, next){
			sails.log.silly('Setting.afterUpdate.saveSetting',setting);
			
			if(setting.secure){
				sails.config.humpback.secure[setting.name] = Setting.convertType(setting.type, setting.setting);
				delete sails.config.humpback.notsecure[setting.name];
			}else{
				sails.config.humpback.notsecure[setting.name] = Setting.convertType(setting.type, setting.setting);
				delete sails.config.humpback.secure[setting.name];
			}

			Setting.updateSetting('name', setting);

			next();
		}
	],
	afterDestroy: [
		function removeSetting(setting, next){
			sails.log.silly('Setting.afterCreate.removeSetting',setting);
			
			delete sails.config.humpback.secure[setting.name];
			delete sails.config.humpback.notsecure[setting.name];

			Setting.removeSetting('name', setting);

			next();
		}
	],

	updateSetting : function updateSetting(id, data) {
		var arr  = sails.config.humpback.settings;
		var index = _.findIndex(arr, _.pick(data, id));
		if( index !== -1) {
			arr.splice(index, 1, data);
		} else {
			arr.push(data);
		}
		return arr;
	},

	removeSetting : function removeSetting(id, data) {
		var arr  = sails.config.humpback.settings;
		var index = _.findIndex(arr, _.pick(data, id));
		if( index !== -1) {
			arr.splice(index, 1);
		}
		return arr;
	},

	convertType: function convertType(type, string) {
		switch (type) {
			case  'json' :  
				return !_.isObject(string) ? JSON.parse(string) : string;

			case  'array' :  
				return !_.isObject(string) ? JSON.parse(string) : string;	

			case 'string':
				return String(string);

			case 'boolean': 
				return Boolean(string);	
			
			case 'date': 
				return Date(string);

			default:
				return string; 
		}
	}


};
