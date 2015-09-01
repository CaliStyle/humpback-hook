'use strict';

//var assert = require('assert');
var request = require('supertest');
//var _ = require('lodash');

describe('Route Controller ::', function () {
	describe('Admin Login', function () {
		it ('Admin Should be able to Login to Create a route', function (done) {

	        request(sails.hooks.http.app)
	            .post('/auth/local')
	            .send({
	              identifier: 'admin',
	              password: 'admin123'
	            })
	            .expect(200)
	            .end(function(err) {
	              done(err);
	            });

	    });
	});

	describe('Create Route', function() {
	    var routeId;

	    it ('Admin Should be able create Route', function (done) {

	        var agent = request.agent(sails.hooks.http.app);

        	agent
            .post('/route')
            .send({
              address: 'get /hello',
              target: {
				view: 'home/index'
			  }
            })
            .expect(201, function (err, res) {

            	if (err) {
                	return done(err);
              	}

              routeId = res.body.id;
              done();

          	});

	    });
	    
	    it ('Admin Should be able get Route', function (done) {

	        var agent = request.agent(sails.hooks.http.app);
	            
            agent
            .get('/route/' + routeId)
            .expect(200, function (err) {

         	 	done(err);

        	});
	    });
	});
	

});