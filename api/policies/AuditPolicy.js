var fnv = require('fnv-plus');
var _ = require('lodash');
var url = require('url');

module.exports = function (req, res, next) {

  //var ipAddress = req.isSocket ? req.socket.handshake.address : req.headers['x-forwarded-for'] || (req.connection && req.connection.remoteAddress);
  //req.ipAddress = ipAddress;

  req.requestId = fnv.hash(new Date().valueOf() + req.ipAddress, 128).str();

  sails.models[sails.config.permission.requestlogModelIdentity].create({
    id: req.requestId,
    ipAddress: req.ipAddress,
    url: sanitizeRequestUrl(req),
    method: req.method,
    body: _.omit(req.body, 'password'),
    model: req.options.modelIdentity,
    user: (req.user || {}).id
  }).exec(_.identity);

  // persist RequestLog entry in the background; continue immediately
  next();
};

function sanitizeRequestUrl (req) {
  var requestUrl = url.format({
    protocol: req.protocol,
    host: req.host || sails.getHost(),
    pathname: req.originalUrl || req.url,
    query: req.query
  });

  return requestUrl.replace(/(password=).*?(&|$)/ig, '$1<hidden>$2');
}
