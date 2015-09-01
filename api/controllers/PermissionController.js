/**
 * Permission Controller
 */

var RoutePermissions = function(route, role){
	this.route = route;
	this.role = role;
	this.grant = [];
};

RoutePermissions.prototype.create = function () {
	var routepermisions = this;	
	var grant = {};
	grant.role = routepermisions.role.name;
	grant.route = routepermisions.route.id;
	grant.action = 'create';
	routepermisions.push(grant);

	return Permission.create({
        route: routepermisions.route.id,
        action: 'create',
        role: routepermisions.role.id
    });

};

RoutePermissions.prototype.read = function () {
	var routepermisions = this;
	var grant = {};
	grant.role = routepermisions.role.name;
	grant.route = routepermisions.route.id;
	grant.action = 'read';
	routepermisions.push(grant);

	return Permission.create({
        route: routepermisions.route.id,
        action: 'read',
        role: routepermisions.role.id
    });
};

RoutePermissions.prototype.update = function () {
	var routepermisions = this;
	var grant = {};
	grant.role = routepermisions.role.name;
	grant.route = routepermisions.route.id;
	grant.action = 'delete';
	routepermisions.push(grant);

	return Permission.create({
        route: routepermisions.route.id,
        action: 'update',
        role: routepermisions.role.id
    });
};

RoutePermissions.prototype.delete = function () {
	var routepermisions = this;
	var grant = {};
	grant.role = routepermisions.role.name;
	grant.route = routepermisions.route.id;
	grant.action = 'delete';
	routepermisions.push(grant);

	return Permission.create({
        route: routepermisions.route.id,
        action: 'update',
        role: routepermisions.role.id
    });
};


var ModelPermissions = function(model, role){
	this.model = model;
	this.role = role;
	this.grant = [];
};

ModelPermissions.prototype.create = function () {
	var modelpermisions = this;	
	var grant = {};
	grant.role = modelpermisions.role.name;
	grant.model = modelpermisions.model.id;
	grant.action = 'create';
	modelpermisions.push(grant);

	return Permission.create({
        model: modelpermisions.model.id,
        action: 'create',
        role: modelpermisions.role.id
    });

};

ModelPermissions.prototype.read = function () {
	var modelpermisions = this;
	var grant = {};
	grant.role = modelpermisions.role.name;
	grant.model = modelpermisions.model.id;
	grant.action = 'read';
	modelpermisions.push(grant);

	return Permission.create({
        model: modelpermisions.model.id,
        action: 'read',
        role: modelpermisions.role.id
    });
};

ModelPermissions.prototype.update = function () {
	var modelpermisions = this;
	var grant = {};
	grant.role = modelpermisions.role.name;
	grant.model = modelpermisions.model.id;
	grant.action = 'delete';
	modelpermisions.push(grant);

	return Permission.create({
        model: modelpermisions.model.id,
        action: 'update',
        role: modelpermisions.role.id
    });
};

ModelPermissions.prototype.delete = function () {
	var modelpermisions = this;
	var grant = {};
	grant.role = modelpermisions.role.name;
	grant.model = modelpermisions.model.id;
	grant.action = 'delete';
	modelpermisions.push(grant);

	return Permission.create({
        model: modelpermisions.model.id,
        action: 'update',
        role: modelpermisions.role.id
    });
};


module.exports = {
		

}