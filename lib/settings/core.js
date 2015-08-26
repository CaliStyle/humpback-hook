'use strict';

exports.syncSettings = function () {

	var Setting = sails.models[sails.config.humpback.settingModelIdentity];

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

};