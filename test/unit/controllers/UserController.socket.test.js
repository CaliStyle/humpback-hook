'use strict';

var assert = require('assert');

describe('User Controller Socket::', function () {


	describe('socket register request', function () {

	    it('should be able to create new user', function (done) {

	      io.socket.post('/register', { 
	        email: 'new.socketuser@email.com', 
	        password: 'admin123' 
	      }, function (data, jwres) {

	        assert.equal(jwres.statusCode, 200);
	        done();

	      });

	    });

	    it('should return error if user already exists', function (done) {

	      io.socket.post('/register', { 
	        email: 'new.socketuser@email.com', 
	        password: 'admin123' 
	      }, function (data, jwres) {

	        assert.equal(jwres.statusCode, 400);
	        done();

	      });

	    });

	});

	describe('socket login request', function () {

      var userId;

      it('should find user if they have been authenticated', function (done) {

        io.socket.post('/auth/local', { identifier: 'existing.user@email.com', password: 'admin123' }, function (data, jwres) {

          assert.equal(jwres.statusCode, 200);

          userId = data.id;

          io.socket.get('/user/' + userId, function(data, jwres) {

            assert.equal(jwres.statusCode, 200);

            done();

          });

        });

      });

      it('should logout', function (done) {

        io.socket.post('/logout', {}, function (data, jwres) {

          assert.equal(jwres.statusCode, 200);
          
          done();
          
        });

      });

      
      it('should not find user if unauthenticated', function (done) {

        io.socket.get('/user/'+ userId, function(data, jwres) {

          assert.equal(jwres.statusCode, 403);

          done();

        });
          
      });
    
    });

});

