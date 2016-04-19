'use strict';

//var assert = require('assert');
var request = require('supertest-as-promised');

describe('Auth Controller ::', function () {

  describe('#callback()', function () {

    describe('http request', function () {

      // it ('passport-local registration should succeed if email and password valid', function (done) {

      //   request(sails.hooks.http.app)
      //     .post('/register')
      //     .send({
      //       email: 'existing.user@email.com',
      //       password: 'admin123'
      //     })
      //     .expect(200)
      //     .end(function(err) {
      //       done(err, sails);
      //     });

      // });

      it ('passport-local authentication should succeed if email and password valid', function (done) {

        request.agent(sails.hooks.http.app)
            .post('/auth/local')
            .send({
              identifier: 'existing.user@email.com',
              password: 'admin123'
            })
            .expect(200)
            .end(function(err) {
              done(err);
            });

      });

      it ('passport-local authentication should fail and return error code if email is invalid', function (done) {

        request.agent(sails.hooks.http.app)
            .post('/auth/local')
            .send({
              identifier: 'invalid@email.com',
              password: 'admin123'
            })
            .expect(403)
            .end(function(err) {
              done(err);
            });

      });

      it ('passport-local authentication should fail and return error code if password is invalid', function (done) {

        request.agent(sails.hooks.http.app)
            .post('/auth/local')
            .send({
              identifier: 'existing.user@email.com',
              password: 'invalid123'
            })
            .expect(403)
            .end(function(err) {
              done(err);
            });

      });

    });

  });

});
