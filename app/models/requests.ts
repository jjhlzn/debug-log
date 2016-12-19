'use strict';

/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var async = require('async');


var Schema = mongoose.Schema;

/**
 * Log Schema
 */
const RequestSchema = new Schema({
  time: { type : String, default : '', trim : true },
  ip: { type : String, default : '', trim : true },
  duration: { type : Number, default : '', trim : true },
  url: { type : String, default : '', trim : true },
  startLog: { type : String, default : '', trim : true },
  endLog: { type : String, default : '', trim : true },
  thread: { type : String, default : '', trim : true }
});


/**
 * Methods
 */
RequestSchema.methods = {

  
};

/**
 * Statics
 */

RequestSchema.statics = {

  /**
   * List articles
   *
   * @param {Object} options
   * @api private
   */

  list: function (options, cb) {
    var self = this;

    const criteria = options.criteria || {};
    const page = parseInt(options.page) - 1 || 0;
    const limit = parseInt(options.pageLimit) || 10;

    var countQuery = (callback) => {
         self.count().exec(function(err, count){
              if(err){ 
                 callback(err, null) 
              }
              else {
                //console.log(results);
                 callback(null, count);
              }
         })
    };

    var retrieveQuery = (callback) => {
        self.find(criteria)
            .limit(limit)
            .skip(limit * page)
            .exec(callback);
    };

    async.parallel([countQuery, retrieveQuery], function(err, results){
         //err contains the array of error of all the functions
         //results contains an array of all the results
         //results[0] will contain value of doc.length from countQuery function
         //results[1] will contain doc of retrieveQuery function
         //You can send the results as

        cb(err, {data: results[1], pageLimit: limit, page: page + 1, totalCount: results[0]});
    });
  }
};

mongoose.model('Request', RequestSchema, 'requests_order');

