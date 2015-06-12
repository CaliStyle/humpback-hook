/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  create: function (req, res) {
    sails.passport.protocols.local.register(req.body, function (err, user) {
      if (err) return res.serverError(err);

      res.ok(user);
    });
  }
};
