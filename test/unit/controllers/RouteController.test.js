'use strict';

//var assert = require('assert');
var request = require('supertest');
//var _ = require('lodash');

describe('Route Controller ::', function () {

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
	/*
    it ('Admin Should be able create Route', function (done) {

        request(sails.hooks.http.app)
            .post('/route')
            .send({
              address: 'get /hello',
              target: {
				view: 'home/index'
			  },
			  title: 'Hello World'
            })
            .expect(200)
            .end(function(err) {
              done(err);
            });

    });
	*/

});