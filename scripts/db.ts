import { print } from 'util';
var mongoose = require('mongoose');
var assert = require('assert');
var moment = require('moment');

var db = mongoose.connection;
var dbURI = 'mongodb://114.215.170.159/debug_log';
db.on('connecting', function() {
  console.log('connecting to MongoDB...');
});

db.on('error', function(error) {
  console.error('Error in MongoDb connection: ' + error);
  mongoose.disconnect();
});
db.on('connected', function() {
  console.log('MongoDB connected!');
});
db.once('open', function() {
  console.log('MongoDB connection opened!');
});
db.on('reconnected', function () {
  console.log('MongoDB reconnected!');
});
db.on('disconnected', function() {
  console.log('MongoDB disconnected!');
  mongoose.connect(dbURI, {server:{auto_reconnect:true}});
});

mongoose.Promise = require('bluebird');
mongoose.connect(dbURI, {server:{auto_reconnect:true}});


var logModels = {};
var requestModels = {};

export function getLogModel(log: any, app: any) {
    let modelName = `logs_${app.name}_${moment(log.time).format('YYYY-MM-DD')}`;
    if (logModels[modelName]) {
      return logModels[modelName];
    }
    logModels[modelName]  = db.model(modelName, { 
      time:    {type: Date,  index: true}, //2015-03-18 00:04:26,442
      level:   String,   //Debug
      clazz:   String,   //HDBusiness.BLL.AlipayInfoBLL
      content: String,
      thread: String,
      app: String    
    }, modelName);
    return logModels[modelName];
}

export function getCappedLogModel() {
  let modelName = `logs_capped`;
  if (requestModels[modelName]) {
      return requestModels[modelName];
    }
  requestModels[modelName] = db.model(modelName, {
      time:    Date,   //2015-03-18 00:04:26,442
      level:   String,   //Debug
      clazz:   String,   //HDBusiness.BLL.AlipayInfoBLL
      content: String,
      thread: String,
      app: String
    }, modelName);
  return requestModels[modelName];
}

export function getLogModel2(app: any) {
    let modelName = `logs_${app.name}_${moment().format('YYYY-MM-DD')}`;
    if (logModels[modelName]) {
      return logModels[modelName];
    }
    logModels[modelName]  = db.model(modelName, { 
      time:    {type: Date,  index: true}, //2015-03-18 00:04:26,442
      level:   String,   //Debug
      clazz:   String,   //HDBusiness.BLL.AlipayInfoBLL
      content: String,
      thread: String,
      app: String
    }, modelName);
    return logModels[modelName];
}

export function getRequestModel(app: any) {
    let modelName = `requests_${app.name}_${moment().format('YYYY-MM-DD')}`;
    //console.log("modelName:", modelName);
    if (requestModels[modelName]) {
      return requestModels[modelName];
    }
    requestModels[modelName]  = db.model(modelName, { 
      time:    {type: Date,  index: true}, //2015-03-18 00:04:26,442
      ip: String,
      duration: Number,
      url: String,
      startLog: Date,
      endLog: Date,
      thread: String,
      app: String,
      logs: [{ time: Date, level: String,  clazz: String, content: String, thread: String}]
    }, modelName);
    return requestModels[modelName];
}

export function getCappedRequestModel() {
    let modelName = `requests_capped`;
    if (requestModels[modelName]) {
      return requestModels[modelName];
    }
    requestModels[modelName]  = db.model(modelName, { 
      time: Date,
      ip: String,
      duration: Number,
      url: String,
      startLog: Date,
      endLog: Date,
      thread: String,
      app: String
    }, modelName);
    return requestModels[modelName];
}

