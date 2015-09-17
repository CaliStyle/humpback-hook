'use strict';

exports.syncSettings = function () {

	var Setting = sails.models[sails.config.humpback.settingModelIdentity];

	return Promise.map(sails.config.humpback.settings, function (setting) {
    	var name, value;
    	for(var key in setting){
    		name = key;
    		value = setting[key];
    	}

    	return Setting.findOrCreate({ name: name }, {name: name, setting: value});
  	
  	})
  	.then(function(settings){
  		sails.log('humpback-hook:', settings.length ,'settings from config to database');

  		return Setting.find({secure: false});
  	})
  	.then(function(settings){
  		sails.log('humpback-hook:', settings.length ,'settings to sync to config');

		_.each(settings, function(setting){
			sails.config.humpback.settings[setting.name] = setting.setting;
		});
	
		sails.log('humpback-hook:', settings.length ,'settings synced to config');
		
		return settings;
  	})
  	.catch(function(e){
  		sails.log.error(e);
		return e;
  	});

  	/*
	return Setting.find({secure: false})
	.then(function(settings){
		sails.log('humpback-hook:', settings.length ,'settings to sync');

		_.each(settings, function(setting){
			sails.config.humpback.settings[setting.name] = setting.setting;
		});
	
		sails.log('humpback-hook:', settings.length ,'settings synced');
		
		return settings;
	})
	.catch(function(e){
		sails.log.error(e);
		return e;
	});	
	*/

};