module.exports = {

  /**
   * Find the route performed on, given the
   * same request.
   */
    findTargetRoute: function(req) {
    	
    	var verb = req.method.toLowerCase();
		var uri = req.url;
		var id = new Buffer(verb + ':' + uri).toString('base64');
		
		var check = new Buffer(id, 'base64').toString().split(':');

		//console.log("ROUTE:", verb, uri);

		console.log(id, check[0], check[1]);

		return sails.models[sails.config.permission.routeModelIdentity].findOne(id).populate('permissions');

    },


	findRoutePermissions: function(options) {
		
		return User.findOne(options.user.id)
	      .populate('roles')
	      .then(function(user) {
	        return Permission.find({
	          route: options.route.id,
	          action: action,
	          or: [{
	            user: user.id
	          }, {
	            role: _.pluck(user.roles, 'id')
	          }]
	        });
	      });
	}

}