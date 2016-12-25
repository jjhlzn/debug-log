/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var async = require('async');

var Schema = mongoose.Schema;
var models = {};

export function getLogModel(appName: string, date: string) {

  let modelName = `logs_${appName}_${date}`;
  if (models[modelName]) {
    return models[modelName];
  }

  const LogSchema = new Schema({
    time: { type : Date, default : new Date() },
    clazz: { type : String, default : '', trim : true },
    content: { type : String, default : '', trim : true },
    level: { type : String, default : '', trim : true },
    thread: { type : String, default : '', trim : true }
  });
  
  
  /**
   * Statics
   */
  LogSchema.statics = {
  
    /**
     * List articles
     *
     * @param {Object} options
     * @api private
     */
    list: function (options, cb) {
      
      var self = this;
  
      const criteria = options.criteria || {};
  
      let page = parseInt(options.page) - 1 || 0;
      const limit = parseInt(options.pageLimit) || 10;
      var countQuery = (callback) => {
           self.count().exec(function(err, count){
                if(err){ 
                   callback(err, null) 
                }
                else {
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
  
  models[modelName] = mongoose.model(modelName, LogSchema, modelName);
  return models[modelName];
}

