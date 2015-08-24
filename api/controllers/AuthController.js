/**
 * Authentication Controller
 */
module.exports = {

    /**
    * Log out a user and return them to the homepage
    *
    * Passport exposes a logout() function on req (also aliased as logOut()) that
    * can be called from any route handler which needs to terminate a login
    * session. Invoking logout() will remove the req.user property and clear the
    * login session (if any).
    *
    * For more information on logging out users in Passport.js, check out:
    * http://passportjs.org/guide/logout/
    *
    * @param {Object} req
    * @param {Object} res
    */
    logout: function (req, res) {
        req.logout();
        if (!req.isSocket) {
          res.redirect(req.query.next || '/');
        }
        else {
          res.ok();
        }
    },

    /**
    * Create a third-party authentication endpoint
    *
    * @param {Object} req
    * @param {Object} res
    */
    provider: function (req, res) {
        sails.passport.endpoint(req, res);
    },

    /**
    * Create a authentication callback endpoint
    *
    * This endpoint handles everything related to creating and verifying Pass-
    * ports and users, both locally and from third-aprty providers.
    *
    * Passport exposes a login() function on req (also aliased as logIn()) that
    * can be used to establish a login session. When the login operation
    * completes, user will be assigned to req.user.
    *
    * For more information on logging in users in Passport.js, check out:
    * http://passportjs.org/guide/login/
    *
    * @param {Object} req
    * @param {Object} res
    */
    callback: function (req, res) {
        function _tryAgain (err) {

            // Only certain error messages are returned via req.flash('error', someError)
            // because we shouldn't expose internal authorization errors to the user.
            // We do return a generic error and the original request body.
            var flashError = req.flash('error')[0];
            if (err || flashError) {
                sails.log.warn(err);
                sails.log.warn(flashError);
            }

            if (err && !flashError ) {
                req.flash('error', 'Error.Passport.Generic');
            }
            else if (flashError) {
                req.flash('error', flashError);
            }
            req.flash('form', req.body);

            // If an error was thrown, redirect the user to the
            // login, register or disconnect action initiator view.
            // These views should take care of rendering the error messages.
            var action = req.param('action');

            if (action === 'register') {
                if (!req.isSocket) {
                    res.redirect('/register');
                }
                else{

                }
            }
            else if (action === 'login') {
                if (!req.isSocket) {
                    res.redirect('/login');
                }
                else{

                }    
            }
            else if (action === 'disconnect') {
                if (!req.isSocket) {
                    res.redirect('back');
                }
                else{
                    
                }
            }
            else {
                // make sure the server always returns a response to the client
                // i.e passport-local bad username/email or password
                res.forbidden();
            }
        }

        sails.passport.callback(req, res, function (err, user) {

            if (err || !user) {
                sails.log.warn(err);
                return _tryAgain();
            }

            req.login(user, function (err) {
                if (err) {
                    sails.log.warn(err);
                    return _tryAgain();
                }

                // Upon successful login, send the user to the homepage where req.user
                // will available.
                req.session.authenticated = true;

                sails.log.info('user', user, 'authenticated successfully');
                return res.json(user);
            });
        });
    },

    /**
    * Disconnect a passport from a user
    *
    * @param {Object} req
    * @param {Object} res
    */
    disconnect: function (req, res) {
        sails.passport.disconnect(req, res);
    }
};
