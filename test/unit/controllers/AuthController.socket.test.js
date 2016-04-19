'use strict';

var assert = require('assert');
//var request = require('supertest-as-promised');

describe('Auth Controller Socket::', function () {

	describe('socket requests', function () {

      it ('passport-local authentication should succeed if email and password valid', function (done) {

        io.socket.post('/auth/local', { identifier: 'existing.user@email.com', password: 'admin123' }, function (data, jwres) {

          assert.equal(jwres.statusCode, 200);
          done();

        });

      });


      it ('passport-local authentication should fail and return error code if email is invalid', function (done) {

        io.socket.post('/auth/local', { identifier: 'invalid@email.com', password: 'admin123' }, function (data, jwres) {

          assert.equal(jwres.statusCode, 403);
          done();

        });

      });

      it ('passport-local authentication should fail and return error code if password is invalid', function (done) {

        io.socket.post('/auth/local', { identifier: 'existing.user@email.com', password: 'invalid1235' }, function (data, jwres) {

          assert.equal(jwres.statusCode, 403);
          done();

        });

      });

    });
});