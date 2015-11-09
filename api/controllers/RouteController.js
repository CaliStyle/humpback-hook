/**
 * RouteController
 *
 * @description :: Server-side logic for managing settings
 * @humpback-docs  :: https://github.com/CaliStyle/humpback/wiki/Controllers#routecontroller
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');

module.exports = {

	/*
	findOne: function(req, res){
		
		var RouteModel = actionUtil.parseModel(req);
		var pk = actionUtil.requirePk(req);

		var routeCache = sails.config._routeCache;
		req.options.routeId = actionUtil.parseModel(req).id;

		req.route = routeCache[req.options.routeId];

		if (_.isObject(req.route) && !_.isNull(req.route.id)) {
    
		    if(_.isObject(req.route.permissions) && _.isObject(req.route.permissions.public)){
		      
		    	var method = RouteService.getMethod(req.method);

		    	//console.log(req.model.permissions.public, method);
		    	if(_.isObject(req.route.permissions.public[method]) && req.route.permissions.public[method].action){
		    		sails.log.verbose("Model modelUnlocked");
		    		req.options.routeUnlocked = true;
		    	}
		    }

		    return next();
		}

		var query = RouteModel.findOne(pk);
		query = actionUtil.populateEach(query, req);
		query.exec(function found(err, matchingRecord) {
		    if (err) return res.serverError(err);
		    if(!matchingRecord) return res.notFound('No record found with the specified `id`.');

		    if (sails.hooks.pubsub && req.isSocket) {
		    	Model.subscribe(req, matchingRecord);
		    	actionUtil.subscribeDeep(req, matchingRecord);
		    }

		    res.ok(matchingRecord);
		});
	}
	*/
	
}