/**
 * Default model configuration
 * (sails.config.models)
 *
 * Unless you override them, the following properties will be included
 * in each of your models.
 *
 * For more info on Sails models, see:
 * http://sailsjs.org/#/documentation/concepts/ORM
 */
var normalize = require('sails/node_modules/waterline/lib/waterline/utils/normalize');
var schema = require('sails/node_modules/waterline/lib/waterline/utils/schema');
var hasOwnProperty = require('sails/node_modules/waterline/lib/waterline/utils/helpers').object.hasOwnProperty;
var defer = require('sails/node_modules/waterline/lib/waterline/utils/defer');
var noop = function() {};

module.exports.models = {
	autoCreatedBy: true,
	dynamicFinders: false,

	/**
	 * [updateOrCreate description]
	 * @param  {[type]}   criteria [description]
	 * @param  {[type]}   values   [description]
	 * @param  {Function} cb       [description]
 	 * @return {[type]}            [description]
	*/
	
	updateOrCreate: function (criteria, values, cb) {
		var self = this; 
		var deferred;

		// Normalize Arguments
		if(typeof cb !== 'function') {
		   deferred = defer();
		}
		cb = cb || noop;
		
		criteria = normalize.criteria(criteria);

		if (criteria === false) {
			if(deferred) {
		  		deferred.resolve(null);
			}
			return cb(null, []);
		}
		else if(!criteria) {
			if(deferred) {
		  		deferred.reject(new Error('No criteria or id specified!'));
			}
			return cb(new Error('No criteria or id specified!'));
		}

		// Build Default Error Message
		var errFind = 'No find() method defined in adapter!';
		var errUpdate = 'No update() method defined in adapter!';
		var errUpdate = 'No create() method defined in adapter!';

		// Find the connection to run this on
		if(!hasOwnProperty(self.adapter.dictionary, 'find')){
			if(deferred) {
		    	deferred.reject(errFind);
		    }
			return cb(new Error(errFind));
		}
		if(!hasOwnProperty(self.adapter.dictionary, 'update')){ 
			if(deferred) {
		    	deferred.reject(errUpdate);
		    }
			return cb(new Error(errUpdate));
		}
		if(!hasOwnProperty(self.adapter.dictionary, 'create')) {
			if(deferred) {
      			deferred.reject(errCreate);
    		}
			return cb(new Error(errCreate));
		}

		var connNameFind = self.adapter.dictionary.find;
		var adapterFind = self.adapter.connections[connNameFind]._adapter;
		
		var connNameUpdate = self.adapter.dictionary.update;
		var adapterUpdate = self.adapter.connections[connNameUpdate]._adapter;

		var connNameCreate = self.adapter.dictionary.create;
		var adapterCreate = self.adapter.connections[connNameCreate]._adapter;

    	adapterFind.find(connNameFind, self.adapter.collection, criteria, normalize.callback(function before (err, results){
    	
    		if (err) {
	    		if(deferred) {
  					deferred.reject(err);
				}
	    		return cb(err);
	  		}

			if(results && results.length > 0){
				adapterUpdate.update(connNameUpdate, self.adapter.collection, criteria, values, normalize.callback(function afterwards (err, updatedRecords) {
					if (err) {
						if(deferred) {
	      					deferred.reject(err);
	    				}
						return cb(err);
					}
					deferred.resolve(updatedRecords[0]);
					return cb(null, updatedRecords[0]);
				}));
			}else{
				adapterCreate.create(connNameCreate, self.adapter.collection, values, normalize.callback(function afterwards (err, createdRecord) {
			    	if (err) {
			    		if(deferred) {
	      					deferred.reject(err);
	    				}
			    		return cb(err);
			    	}
			    	deferred.resolve(createdRecord);
			    	return cb(null, createdRecord);
			    }));
			}
    	}));
	  	
	  	if(deferred) {
		    return deferred.promise;
		}
	}
}