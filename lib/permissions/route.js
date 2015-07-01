'use strict';

/**
 * Creates default Rotues
 *
 * @public
 */

 //sails.config.routes


 /**
 * Create default Route permissions
 */
exports.create = function (roles, models, admin) {
	var Route = sails.models[sails.config.permission.routeModelIdentity];
	console.log(Route,roles, models, admin);

	console.log(sails);

	return Promise.all([

	]);
	
};