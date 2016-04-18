'use strict';

//var assert = require('assert');
var request = require('supertest-as-promised');
//var _ = require('lodash');

describe('Route Controller ::', function () {
	
	var routeId;
	var agent;

	describe('Admin Routing', function () {
		
	    it ('should be not found', function (done) {

	        agent = request.agent(sails.hooks.http.app);
	            
            agent
	            .get('/hello')
	            .expect(404, function (err) {

	         	 	done(err);

	        	});
	    });

	    it ('should be able to Login', function(done) {
	    	
	    	agent
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

	    it ('should be able to create route', function (done) {

	
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
	            		console.log(err);
	                	return done(err);
	              	}
	            	routeId = res.body.id;
	            	
	            	done();
	          	});
	            
	    });

	    
	    it ('should be able get Route', function (done) {

	        //var agent = request.agent(sails.hooks.http.app);
	            
            agent
	            .get('/route/' + routeId)
	            .expect(200, function (err) {

	         	 	done(err);

	        	});
	    });
	    
	});
});