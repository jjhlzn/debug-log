
/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var async = require('async');
import { getLogModel } from './logs';

var Schema = mongoose.Schema;
var models = {};

export function getRequestModel(appName: string, date: string) {
  let modelName = `requests_${appName}_${date}`;
  if (models[modelName]) {
    return models[modelName];
  }

  const RequestSchema = new Schema({
    time: { type : Date },
    ip: { type : String, default : '', trim : true },
    duration: { type : Number, default : '', trim : true },
    url: { type : String, default : '', trim : true },
    startLog: { type : Date },
    endLog: { type : Date },
    thread: { type : String, default : '', trim : true },
    app: { type : String, default : '', trim : true }
  });

  RequestSchema.statics = {
  
    get: function(options, cb) {
      this.findOne({_id: options.id}).exec( (err, doc) => {
        if (err) {
          console.error(err);
          cb(500, null);
          return;
        }
        console.log("request: ", doc);

        let Log = getLogModel(appName, date);
        if (doc) {
          Log.find({})
            .where('time').gte(doc.startLog).lte(doc.endLog)
            .where('thread').eq(doc.thread)
            .sort({"_id":1})
            .exec((err, logs) => {
              console.log("logs: ", logs);
              if (err) {
                console.error(err);
                cb(500, null);
                return;
              }
              cb(null, logs);
            });
        } else {
          cb(404, null);
        }
      });
    },

    list: function (options, cb) {
      var self = this;
  
      const criteria = options.criteria || {};
      const page = parseInt(options.page) - 1 || 0;
      const limit = parseInt(options.pageLimit) || 20;
  
      var countQuery = (callback) => {
           self.count()
               .where('url').ne('/visitorbookcenter.aspx').exec(function(err, count){
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
              .where('url').ne('/visitorbookcenter.aspx')
              .sort({time: 1})
              .limit(limit)
              .skip(limit * page)
              .exec(callback);
      };
  
      async.parallel([countQuery, retrieveQuery], function(err, results){
          cb(err, {data: results[1], pageLimit: limit, page: page + 1, totalCount: results[0]});
      });
    }

  }

  models[modelName] = mongoose.model(modelName, RequestSchema, modelName);
  return models[modelName];


};



