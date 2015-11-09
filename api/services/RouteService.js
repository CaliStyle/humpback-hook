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
    	
		var RouteModel = sails.models[sails.config.permission.routeModelIdentity],
			verb = req.method.toLowerCase(),
			uri = req.url,
	 		pk = new Buffer(verb + ':' + uri).toString('base64'),
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
						sails.config._routeCache.push(route);
					}else{
						//This route is undefined so it is unlocked.
						sails.log.verbose("Route routeUnlocked");
						req.options.routeUnlocked = true;
						sails.config._routeCache[pk] = ({id: pk});
					}
					req.options.routeId = pk;
					req.route = sails.config._routeCache[req.options.routeId];
					
					if(_.find(req.route.roles, { name: 'public' })){
						req.options.routeUnlocked = true;
					}
					resolve(req.route);
				})
				.catch(function(e){
					sails.log.error(e);
					resolve({});
				});
			}
		});
    },

	findUserRouteRoles: function(options) {
		
		return User.findOne(options.user.id)
	      .populate('roles')
	      .then(function(user) {
	      	return _.any(options.roles, _.matches(user.roles));
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
		return [
			'User', options.user.username, 'is not permitted to', options.method, options.route.uri
		].join(' ');
	},

}