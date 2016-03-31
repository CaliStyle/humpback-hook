var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');

/**
 * Query the Model that is being acted upon, and set it on the req object.
 */
module.exports = function ModelPolicy (req, res, next) {

  var modelCache = sails.config._modelCache;
  req.options.modelIdentity = actionUtil.parseModel(req).identity;

  if (_.isEmpty(req.options.modelIdentity)) {
    return next();
  }

  req.options.modelDefinition = sails.models[req.options.modelIdentity];
  req.model = modelCache[req.options.modelIdentity];

  if (_.isObject(req.model) && !_.isNull(req.model.id)) {

    if(_.isObject(req.model.permissions) && _.isObject(req.model.permissions.public)){

      var method = PermissionService.getMethod(req.method);

      //console.log(req.model.permissions.public, method);
      if(_.isObject(req.model.permissions.public[method]) && req.model.permissions.public[method].action){
        sails.log.verbose("Model modelUnlocked");
        req.options.modelUnlocked = true;
      }
    }

    return next();
  }

  sails.log.warn('Model [', req.options.modelIdentity, '] not found in model cache');

  // if the model is not found in the cache for some reason, get it from the database
  sails.models[sails.config.permission.modelModelIdentity].findOne({ identity: req.options.modelIdentity })
    .then(function (model) {
      if (!_.isObject(model)) {
        req.options.unknownModel = true;

        if (!sails.config.permissions.allowUnknownModelDefinition) {
          return next(new Error('Model definition not found: '+ req.options.modelIdentity));
        }
        else {
          model = sails.models[req.options.modelIdentity];
        }
      }

      req.model = model;
      next();
      return null;
    })
    .catch(next);
};
