'use strict';

/**
 * Creates database representations of the Model types.
 * Loops through sails.models and looks for non-private models to create Permissions for
 * @public
 */

exports.createModels = function () {
  sails.log('humpback-hook: syncing waterline models');

  var models = [];
  _.each(sails.models, function (model) {
    if(model && model.globalId && model.identity && !model.private){
      models.push({
        name: model.globalId,
        identity: model.identity,
        attributes: _.omit(model.attributes, _.functions(model.attributes))
      });
    }
  });

  sails.log('humpback-hook:', models.length ,' waterline models synced');

  return Promise.map(models, function (model) {
    var Model = sails.models[sails.config.permission.modelModelIdentity];
    return Model.updateOrCreate({ name: model.name }, model);
  });
};
