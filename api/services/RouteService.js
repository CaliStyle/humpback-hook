module.exports = {

  /**
   * Find the route performed on, given the
   * same request.
   */
    findTargetRoute: function(req) {
    	
    	var method = req.method.toLowerCase();
		var uri = req.url;
		var id = new Buffer(method + ':' + uri).toString('base64');
		
		console.log("ROUTE:", method, uri);

		console.log(id);

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