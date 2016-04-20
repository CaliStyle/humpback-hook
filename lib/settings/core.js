'use strict';

exports.syncSettings = function () {

	var Setting = sails.models[sails.config.humpback.settingModelIdentity];

	return Promise.all(
		_.map(sails.config.humpback.settings, function (setting) {
    		return Setting.findOrCreate({ name: setting.name }, setting);
    	})
  	)
  	.then(function(nondbSettings){
  		sails.log('humpback-hook:', nondbSettings.length ,'settings from config to database');
  		return Setting.find();
  	})
  	.then(function(dbSettings){
  		sails.log('humpback-hook:', dbSettings.length ,'settings to sync to config');

  		//sails.config.humpback.settings = {};
  		
		_.each(dbSettings, function(setting){
			
			if(setting.secure){
				sails.config.humpback.secure[setting.name] = Setting.convertType(setting.type, setting.setting);
			}else{
				sails.config.humpback.notsecure[setting.name] = Setting.convertType(setting.type, setting.setting);
			}

		});
		
		console.log(sails.config.humpback.secure, sails.config.humpback.notsecure);

		return dbSettings;
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