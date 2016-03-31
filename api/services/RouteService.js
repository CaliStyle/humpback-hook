var Promise = require('bluebird');
var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');

var methodMap = {
  POST: 'create',
  GET: 'read',
  PUT: 'update',
  DELETE: 'delete'
};

module.exports = {

	/**
	* Find the route performed on, given the
	* same request.
	*/
    findTargetRoute: function(req) {
    	var ThisModel = req.model,
			RouteModel = sails.models[sails.config.permission.routeModelIdentity],
			verb = req.method.toLowerCase(),
			uri = req.url,
	 		pk = _.isObject(ThisModel) && actionUtil.parsePk(req) && ThisModel.identity == RouteModel.identity ? actionUtil.parsePk(req) : new Buffer(verb + ':' + uri).toString('base64'),
	 		check = new Buffer(pk, 'base64').toString().split(':'),
	 		routeCache = sails.config._routeCache;

		sails.log.verbose("ROUTE", pk, check[0], check[1]);
		
		req.options.routeId = pk;
		req.route = routeCache[req.options.routeId];

		return new Promise(function(resolve, reject){

			if (_.isObject(req.route) && !_.isNull(req.route.id) && _.isObject(req.route.roles)) {
			    if(_.find(req.route.roles, { name: 'public' })){
			    	//console.log(req.model.permissions.public, method);
			    	sails.log.verbose("Route routeUnlocked");
			    	req.options.routeUnlocked = true;
			    	
			    }else{
			    	//Do something if the route is not public
			    }
			   	
			   	resolve(req.route);
			
			}else{
				RouteModel.findOne(pk)
				.populate('roles')
				.then(function(route){
					if(route){
						sails.config._routeCache[pk] = route;
					}else{
						//This route is undefined so it is unlocked.
						sails.log.verbose("Route routeUnlocked");
						req.options.routeUnlocked = true;
						sails.config._routeCache[pk] = {
							id: pk
						};
					}
					req.options.routeId = pk;
					req.route = sails.config._routeCache[req.options.routeId];
					
					if(_.find(req.route.roles, { name: 'public' })){
						req.options.routeUnlocked = true;
					}
					resolve(req.route);
					return null;
				})
				.catch(function(e){
					sails.log.error(e);
					resolve({});
					return null;
				});
			}
		});
    },

	findUserRouteRoles: function(options) {
		return new Promise(function(resolve, reject){
			if(!options.route.roles || options.route.roles.length === 0){
				sails.log.verbose('RouteService: No Route Roles');
				return resolve([{name: 'public'}]);
			}
			if(!options.user){
				sails.log.verbose('RouteService: Public User');
				var userRoles = ['public'];
				var routeRoles = _.pluck(options.route.roles, 'name');
				return resolve(_.intersection(routeRoles, userRoles));
				
			}
			User.findOne(options.user.id)
		    .populate('roles')
		    .then(function(user) {

		    	var userRoles = _.pluck(user.roles, 'name');
		    	console.log(userRoles);
				var routeRoles = _.pluck(options.route.roles, 'name');
				console.log(routeRoles);
				return resolve(_.intersection(routeRoles, userRoles));
		    	//return resolve(_.findByValues(options.route.roles, "name", _.pluck(user.roles, 'name')));
		      	//resolve(_.any(options.route.roles, _.matches(user.roles)));
		      	//return resolve(_.any(_.pluck(options.route.roles, 'name'), _.matches(_.pluck(user.roles, 'name'))));
		    });
		});
	},

	/**
	* Given an action, return the CRUD method it maps to.
	*/
	getMethod: function(method) {
		return methodMap[method];
	},

	/**
	* Build an error message
	*/
	getErrorMessage: function(options) {
		if(!options.user){
			return [
				'Unauthenticated User is not permitted to', options.verb, options.route.id
			].join(' ');
		}
		return [
			'User', options.user.username, 'is not permitted to', options.verb, options.route.id
		].join(' ');
	}
}