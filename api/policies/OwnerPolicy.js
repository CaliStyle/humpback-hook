/**
 * The comment below, and the name of this file/function is confusing to me
 * Ensure that the 'owner' property of an Object is set upon creation.
 */
module.exports = function OwnerPolicy (req, res, next) {
  
  //console.log("Owner Policy","DID I RUN?????");
  
  //sails.log('OwnerPolicy()');
  if (req.options.modelUnlocked) {
    return next();
  }

  if (!req.user || !req.user.id) {
    req.logout();
    return res.forbidden({ error: 'Authenticiation Required' });
    //return res.send(500, new Error('req.user is not set'));
  }
  
  sails.log.verbose('OwnerPolicy user', req.user);
  sails.log.verbose('OwnerPolicy method', req.method);
  sails.log.verbose('OwnerPolicy req.body', req.body);
  

  if (req.options.modelDefinition.autoCreatedBy === false) {
    sails.log.verbose('OwnerPolicy hasOwnershipPolicy: false');
    return next();
  }

  if ('POST' == req.method) {
    //req.body || (req.body = { });
    req.body.owner = req.user.id;
  }

  //sails.log('OwnerPolicy req.model', req.model);
  next();
  return null;
};
