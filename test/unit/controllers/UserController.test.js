'use strict';

var assert = require('assert');
var request = require('supertest');
//var _ = require('lodash');

describe('User Controller ::', function () {

  /*
  before(function (done) {
    request(sails.hooks.http.app)
      .post('/register')
      .send({
        email: 'me@mocha.test',
        password: 'admin123'
      })
      .expect(200)
      .end(function (err) {
        done(err);
      });
  });
  */
  

  describe('#create()', function () {

    describe('http request', function () {
      
      it('should return redirect to after registration', function (done) {

        request(sails.hooks.http.app)
            .post('/register?next=%2F')
            .send({
              email: 'new.user@email.com',
              password: 'admin123'
            })
            .expect(302)
            .end(function (err) {
              done(err);
            });

      });

      it('should return 302 and error if user already exists', function (done) {

        request(sails.hooks.http.app)
            .post('/register')
            .send({
              email: 'new.user@email.com',
              password: 'admin123'
            })
            .expect(302)
            .end(function (err) {
              done(err);
            });

      });
      it('should return a 500 error', function (done) {

        request(sails.hooks.http.app)
            .post('/user/create')
            .send({
              email: 'new.user@email.com',
              password: 'admin123'
            })
            .expect(500)
            .end(function (err) {
              done(err);
            });

      });

      it('should return a user', function (done) {

        request(sails.hooks.http.app)
            .post('/user/create')
            .send({
              email: 'newest.user@email.com',
              password: 'admin123'
            })
            .expect(200)
            .end(function (err) {
              done(err);
            });

      });

    });

  });
    
  describe('socket request', function () {

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
  
  describe('#findOne()', function () {

    describe('http request', function () {

      var userId;

      it('should find user if they have been authenticated', function (done) {

        var agent = request.agent(sails.hooks.http.app);

        agent
            .post('/auth/local')
            .send({
              identifier: 'existing.user@email.com',
              password: 'admin123'
            })
            .expect(200, function (err, res) {

              if (err) {
                return done(err);
              }

              userId = res.body.id;

              agent
                  .get('/user/' + userId)
                  .expect(200)
                  .end(function (err) {
                    done(err);
                  });
            });

      });

      it('should be able to update the password', function (done) {

        var agent = request.agent(sails.hooks.http.app);

        agent
          .post('/auth/local')
          .send({
            identifier: 'existing.user@email.com',
            password: 'admin123'
          })
          .expect(200, function (err, res) {

            if (err) {
              return done(err);
            }

            userId = res.body.id;

            agent
              .put('/user/' + userId)
              .send({
                password: 'admin1234'
              })
              .expect(200)
              .end(function (err) {
                done(err);
              });
          });
      });

      it('should logout', function (done) {

        var agent = request.agent(sails.hooks.http.app);

        agent
            .post('/logout')
            .send({})
            .expect(302, function (err) {

              done(err);

            });

      });
      
      
      it('should not find user if unauthenticated', function (done) {

        var agent = request.agent(sails.hooks.http.app);

        agent
          .get('/user/' + userId)
          .expect(403)
          .end(function (err) {
            done(err);
          });
      });
    

    });

    describe('socket request', function () {

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

});
