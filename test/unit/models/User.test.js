'use strict';

var assert = require('assert');

describe('User Model ::', function () {

  describe('#beforeValidate()', function () {

    it ('should generate a username if empty', function (done) {

      sails.models.user.beforeValidate[0]({ email: 'admin@test.com' }, function (err, values) {

        assert.equal(values.username, 'adminATtestDOTcom');
        done(err);

      });

    });

  });

});