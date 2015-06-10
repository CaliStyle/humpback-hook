'use strict';

var sails = require('sails');

describe('Basic tests ::', function() {

    // Before running any tests, attempt to lift Sails
    before(function (done) {

      // Hook will timeout in 10 seconds
      this.timeout(11000);

      // Attempt to lift sails
      sails.lift({
          hooks: {
           // Load the hook
           'humpback-hook': require('../'),
           // Skip grunt (unless your hook uses it)
           'grunt': false
          },
          models: {
              migrate: 'drop'
          },
         log: {level: 'error'}
      },function (err, sails) {
          if (err) {
              return done(err);
          } else {
              done(null, sails);
          }
      });
    });

    // After tests are complete, lower Sails
    after(function (done) {

      // Lower Sails (if it successfully lifted)
      if (sails) {
          return sails.lower(done);
      }
      // Otherwise just return
      return done();
    });

    // Test that Sails can lift with the hook in place
    it ('sails does not crash', function() {
      return true;
    });

 });